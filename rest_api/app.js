const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;
/*  env variables jsou setnuty v app-env file
pro precteni a setnuti ev variable pouzij
source app-env
*/

const feedRoutes = require('./routes/feed');

// bodyparser inicializujeme s urlencoded


// x-www-urlencoded je default pro data ktera jsou submitnuta v <form> elementu
// toto se hodi pro requesty z daty ktera jsou ve formatu x-www-urlencoded
// app.use(bodyParser.urlencoded());

// toto se hodi pro data s application/json headery
app.use(bodyParser.json());

// requesty co zacinaji na /images serviruj staticly z folderu /images
app.use('/images', express.static(path.join(__dirname, '/images')));

app.use((req, res, next)=> { console.log('*** new request ***'); next(); });

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

/* V MONGODB_URI definujeme i nazev databaze, tady je "restApi"
...cluster0-purr1.mongodb.net/restApi?retryWrites.... 
*/

// global error handling
app.use((err, req, res, next) => {
   // console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    console.log(err.message);
    res.status(status).json({message:message});
   
});

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
.then(()=> {
    console.log('===== app listen ====');
    app.listen(8080);
})
.catch(e => console.log(e));

