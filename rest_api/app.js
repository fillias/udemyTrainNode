const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const auth = require('./middleware/auth');


const MONGODB_URI = process.env.MONGODB_URI;
/*  env variables jsou setnuty v app-env file
pro precteni a setnuti ev variable pouzij
source app-env
*/
//console.log(MONGODB_URI);


/* graphQL */
const { graphqlHTTP } = require('express-graphql');
const graphQlSchema = require('./graphql/schema');
const graphQlResolver = require('./graphql/resolvers');

// bodyparser inicializujeme s urlencoded


// x-www-urlencoded je default pro data ktera jsou submitnuta v <form> elementu
// toto se hodi pro requesty z daty ktera jsou ve formatu x-www-urlencoded
// app.use(bodyParser.urlencoded());

app.use(bodyParser.json()); // application/json


/* uploading images */
// multer je middleware ktery se podiva do kazdeho requestu jestli je to multipart form data
// a pokud to tak je tak se pokusi ty data extractnout
// single mu rekne ze je to jen jeden file a 'image' je ten input name ktery ma hledat
// multer bere options v {}, ,kde 'dest' je folder kam to ma uploadnout
// v defaultu tomu uploadlemu binary data da nejaky random hash name
// lepsi je pouzit multer 'diskStorage' ktery se preda jako storage
// Multer adds a body object and a file or files object to the request object. 
// The body object contains the values of the text fields of the form, 
// the file or files object contains the files uploaded via the form.
// https://expressjs.com/en/resources/middleware/multer.html

const fileStorage = multer.diskStorage({
    // diskstorage ma object s dvemi funkcemi ktere zavola pro incoming file 
    destination: (req, file, cb) => {
         // callback se zavola jakmile je hotovo
        // u cb() je prvni argument chyba, pokud neni tak ze zada null
        // druhy argument je misto kam ma file ulozit
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        // druhy argument je jmeno souboru jak to ma nazvat
        // file obsahuje 'originalname' coz je jmeno co to ma od uzivatele vcetne pripony
        // coz se da pouzit napr. takto aby se neprepsal soubor kdyby se jmeno shodovalo
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // filefilter umoznuje konfigurovat co chceme ukladat
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
     //console.log(file);
    
    // cb(null, true) -- zavolat pokud soubor chceme ulozit
    // cb(null, false) -- zavolat pokud soubor nechceme ulozi
        cb(null, true);
    } else {
        cb(null, false);
    }
};


app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));



app.use((req, res, next) => {
    console.log('*** new request ***');
    next();
});

// vyreseni CORS
app.use((req, res, next) => {
    // setHeader modifikuje headery (neprepisuje komplet)
    //, v tomhle pripade uz bude v Header neco od json()
    // Access-Control-Allow-Origin - povolime urcime domeny oddelene carkou, nebo vsechny *
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Access-Control-Allow-Methods- povolime urcime http metody oddelene carkou
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    // Access-Control-Allow-Headers - povolime jake Headery muzou klienti pouzivat. 
    // nektere jsou v defaultu povolene, nektere se musi specifikovat
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    /* graphql nejdriv posle options request ktery se jinak zablokuje */
    
    if (req.method == 'OPTIONS') {
        // vratime prazdnou odpoved s 200 a request se nedostane dal
        // options request se tak nedostane do graphql endpoint
        return res.sendStatus(200);
    }
    

    next();
});

app.use(auth);


app.put('/post-image', (req, res, next) => {

    if (!req.isAuth) {
        throw new Error('unauthorized');
    }

    if (!req.file) {
        return res.status(200).json({message: 'not file provided'});
    }

    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    console.log(req.file);
    return res.status(201).json({message: 'file stored', filePath: req.file.path});

});

app.use(auth);

// routa pro graphQL
app.use('/graphql', graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolver,

    // graphiql: true je development api pro testovani query v prohlizeci 
    graphiql: true,
    
    /* graphql costom error handling */
    
    customFormatErrorFn(err) {
       // vraci default error
       // return err;

       // err.originalError se setne pokud nekde v kodu nastane throw error
        if (!err.originalError) {
            return err;
        }

        // pokud neexistuje error - napriklad dnejaka syntax chyba v query, tak err.originalError neexistuje
        const data = err.originalError.data;
        const message = err.message || 'chyba';
        const code = err.originalError.code || 500;
        console.log(data);
        return { message: message, status: code, data: data };


    }
    
}));

/* V MONGODB_URI definujeme i nazev databaze, tady je "restApi"
...cluster0-purr1.mongodb.net/restApi?retryWrites.... 
*/

// global error handling
app.use((err, req, res, next) => {
    // console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    console.log(err);
    res.status(status).json({
        message: message,
        data: err.data
    });

});

mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        // useFindAndModify: false je neco kvuli deprecation warning v mongoose 
        useFindAndModify: false
    })
    .then(() => {
        console.log('<==== app listen ====>');
        app.listen(8080);
    })
    .catch(e => console.log(e));


const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};