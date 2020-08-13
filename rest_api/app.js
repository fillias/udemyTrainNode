const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const MONGODB_URI = process.env.MONGODB_URI;
/*  env variables jsou setnuty v app-env file
pro precteni a setnuti ev variable pouzij
source app-env
*/
//console.log(MONGODB_URI);

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

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

    next();
});


// to co zacina v url na /feed tak posli pres feedRoutes
app.use('/feed', feedRoutes);

app.use('/auth', authRoutes);


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
        const server = app.listen(8080);
        // socket io vraci funkci ktera ocekava jako argument server kde ma bezet
        // websockety bezi nad http protokoloem, a node server spusti html server
        /* na serveru  npm install --save socket.io
        ** na FE  npm install --save socket.io-client
        */
        const io = require('./socket').init(server);


        io.on('connection', socket => {
            /* io object setne vse potrebne pro websocket 
            ** event listener na connecton, zavola fci kde socket je klient connection
            ** pro kazdeho klienta co se spoji zavola novou fci
            */
            console.log('websocket connection');
            // console.log(socket);
        });


    })
    .catch(e => console.log(e));