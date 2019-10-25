const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const app = express();
/* set view engine a default folder pro views */
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use( (req, res, next) => {
    console.log('');
    console.log('=============== new request ================');
    console.log('');
    next();
});


/* pridani usera - registrujeme novy middleware abychom meli usera v requestech po cele app */
app.use( (req, res, next) => {
     // natvrdo se "prihlasime" jako user 1 a predame id dal (ulozime ho do requestu)
    User.findByID('5cbf200e6ade5639445dd6c2').then(user => {
       // console.log('user._id v app.js', user._id);
        /*  req.user je jen object s props jak ho vytahnem z db 
        **  req.user = user; (neobsahuje metodu user modelu)
        ** takze pomoci new User
        */
        req.user = new User(user.username, user.email, user.cart, user._id);     
       // console.log(user); 
        next();
    }).catch(err => console.log(err));
} );


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

/* mongoConnect je funkce */

mongoConnect(() => {
    
    /* tento callback zavola mongoConnect kdyz se db spoji */
   app.listen(3000);
});


