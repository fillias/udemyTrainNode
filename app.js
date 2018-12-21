const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();


app.use(bodyParser.urlencoded( {extended: false} ));

app.use('/admin', adminRoutes);
app.use(shopRoutes);



/* handling 404 - pokud request doputuje az sem a neni nikde vys vyresen je to stranka nenalezena 
** v jakykoliv get post atd req, app.use('/', fn)  (prvni argument neni vyzadovan) */
app.use( (req, res, next) => {
    res.status(404).send('<h2> page not found </h2><a href = "/">goto home</a>');
})

app.listen(3000);
