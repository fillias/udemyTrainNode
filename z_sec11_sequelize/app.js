const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');

/* importnem models (tables v databazi) */
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');


const app = express();
/* set view engine a default folder pro views */
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/* jen jednou jsme pro dev vytvorili usera */

// User.create({name:'filip', email:'email'}).then(user => {
//     sequelize.sync().then(res => {
//        // app.listen(3000);
//        console.log('===  USER filip created ===');
//     }).catch(err => {
//         console.log('app.js sequelize err: ', err);
//     })
// })


/* pridani usera - registrujeme novy middleware abychom meli usera v requestech po cele app */
app.use( (req, res, next) => {
     // natvrdo se "prihlasime" jako user 1 a predame id dal (ulozime ho do requestu)
     // do req objectu muzeme pridavat novy fieldy, jen neprepisovat stavajici
     // pridame user jako sequelize object (user bude obsahovat vsechny sequelize utility)
    
    User.findById(1).then(user => {
        // console.log('*********************');
        // console.log(user);
        // console.log('*********************');
        req.user = user;

        /* a jednou jsme vytvorili "prazdny cart" */
        //user.createCart();
        
        next();
    }).catch(err => console.log(err));
} );


app.use( (req, res, next) => {
    console.log('');
    console.log('=============== new request ================');
    console.log('');
    next();
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

/* vytvorime table v db pokud jeste neexistuje */
/* sync() vytvori table a pokud je mame tak i relations 
** sequelize udela query

    Executing (default): CREATE TABLE IF NOT EXISTS `products` (`id` INTEGER auto_increment , `title` VARCHAR(255), `price` DOUBLE PRECISION NOT NULL, `imageUrl` VARCHAR(255) NOT NULL, `description` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
Executing (default): SHOW INDEX FROM `products`

pred sync() nadefinujeme relations
pokud dame sync({force:true}) tak vytvori vzdu nove (premaze stare tabulky) -- jen v development kdyz chceme.
belongsTo = Will add a userId attribute to Product to hold the primary key value for User (one-to-one relation)
v options resime constraints - musi se table v db vytvorit v nejakem poradi
onDelete = co se ma stat kdyz se neco vymaze

1 to many relation user has many product (belongsTo by se v tomhle pripade dalo vynechat, ale takhle je to explicitne receno)

sequelize z relations vytvori asociace a tedy i ty custom metody ktere lze pak volat
napr user.getProducts(), user.createProduct() atd
*/

/* relation kdyz uzivatel vytvari produkty - nejakej admin */
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);



/* definujeme many to many relationships cart - product */

/* hasOne a belongTo neni treba takto explicitne definovat ale lze to (staci definovat jeden z nich) */
/* rozdil mezi hasOne a belongsTo pri 1:1 relation je v tom, do ktery tabulky se zapise foregin key te druhe */
/*  http://docs.sequelizejs.com/manual/associations.html  */

User.hasOne(Cart); // Will add userId to Cart model
//Cart.belongsTo(User);  // Will add userId to Cart model

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

/* definujem relace mezi order, user a product */
Order.belongsTo(User); // Will add userId to Order model
User.hasMany(Order); // 1:many relationship - one user can have many orders

Order.belongsToMany(Product, {through: OrderItem});


sequelize
    .sync()
    //.sync({force:true}) // tohle dropne vsechny tabulky
    .then(res => {
    //console.log(res);
    /* appku pustime jen kdyz mame spojeni s DB */
    app.listen(3000);
}).catch(err => {
    console.log('app.js sequelize err: ', err);
})

