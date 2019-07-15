const express = require('express');
const bodyParser = require('body-parser');
const app = express();

/* body-parser instalovan pres npm resi parsovani res.body 
** defaultne express odpovedi neparsuje (data, napr POST od uzivatele jedou po chunks a musi se po skonceni parsovat)
** body-parser - registrujeme dalsi middleware (on na konci vola next() takze to pojede dal) 
** body-parser parsi POST requesty */

/* body parser je treba volat s config options jinak v konzoli hlasi
** "body-parser deprecated undefined extended: provide extended option app.js:9:20"
** extended false je ze to parsuje nestandardni features
*/
app.use(bodyParser.urlencoded( {extended: false} ));

app.use('/add-product', (req, res, next) => {
    res.write('<html><body><form action="/product" method ="POST"><input type="text" name="title"><button type="submit">add product</button></form></body></html>');
});

/* express().get a express().post je to samy jak .use ale handluje jen tyto requesty */
app.post('/product', (req, res, next) => {
    /* bez body-parser je req.body undefined */
    console.log(req.body);
    res.redirect('/');
});

app.use('/', (req, res, next) => {

    res.send('<h2>kuk</h2>');

} );

app.listen(3000);
