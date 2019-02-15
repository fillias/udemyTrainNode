const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');



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

/* vytvorime table v db pokud jeste neexistuje */
/* sync() vytvori table a pokud je mame tak i relations 
** sequelize udela query

    Executing (default): CREATE TABLE IF NOT EXISTS `products` (`id` INTEGER auto_increment , `title` VARCHAR(255), `price` DOUBLE PRECISION NOT NULL, `imageUrl` VARCHAR(255) NOT NULL, `description` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
Executing (default): SHOW INDEX FROM `products`

*/
sequelize.sync().then(res => {
    //console.log(res);
    /* appku pustime jen kdyz mame spojeni s DB */
    app.listen(3000);
}).catch(err => {
    console.log('app.js sequelize err: ', err);
})


