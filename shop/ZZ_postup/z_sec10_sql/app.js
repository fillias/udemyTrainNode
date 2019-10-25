const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

/* priklad spojeni s mysql 
const db = require('./util/database');

** db je pool promise 
** pomoci execute vkladam sql dotazy 


db.execute('SELECT * FROM products')
    .then( (result) => {
        // result je array, [0] je array zaznamu, [1] metadata
        console.log('db.execute result: ', result[0]);
    })
    .catch(err => {
        console.log('db.execute err: ', err);
    });
*/

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
