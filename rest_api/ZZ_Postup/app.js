const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

// bodyparser inicializujeme s urlencoded


// x-www-urlencoded je default pro data ktera jsou submitnuta v <form> elementu
// toto se hodi pro requesty z daty ktera jsou ve formatu x-www-urlencoded
// app.use(bodyParser.urlencoded());

// toto se hodi pro data s application/json headery
app.use(bodyParser.json());

app.use((req, res, next)=> { console.log('*** new request ***'); next(); })

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


console.log('===== app listen ====');
app.listen(8080);