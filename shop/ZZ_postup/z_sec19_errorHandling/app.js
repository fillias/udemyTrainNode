const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

const errorController = require('./controllers/error');

// CSRF ochrana formularu pomoci tokenu
const csrf = require('csurf');

const flash = require('connect-flash');
// express-session pro server-side session
const session = require('express-session');
// session - mongo db pro ukladani sessions do mongo, 
//a rovnou to zavolame s funkci s argumentem - pozadovanou session
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    // auth sessions nebudeme ukladat do pameti ale do db
    // chce to vedet uri: kam se spojit a collection
    uri: MONGODB_URI, 
    collection: 'sessions'   
});

const User = require('./models/user');

const app = express();
/* set view engine a default folder pro views */
app.set('view engine', 'ejs');
app.set('views', 'views');

// inicializujeme csrf protection s default settings
const csrfProtection = csrf();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    // props pro session, minimalne nastavit toto:

    //  secret = pouziva se pro podepsani session, hodnota jakykoliv dlouhy string
    secret: 'blabla', 
    // resave = session nebude ulozena na kazdy request a kazdy response, pouze kdyz se neco zmeni (improve performance)
    resave: false,
    // saveUninitialized -- dasli performance vec
    saveUninitialized: false, 
    // a rekneme session co ma pouzit za store k ukladani sessions
    store: store
}));

// connect-flash middleware ktere umoznuje predavat informace mezi requesty pomoci session tak, 
// ze jakmile se predavana informace pouzije, ze session se zahodi
app.use(flash());

// po tom co inicializujeme session (csurf ji pouziva pridame middleware )
app.use(csrfProtection);


// pridame middleware ktere preda pozadovana data ke vsem requestum
// express umi "res.locals"
// toto prida pozadovane locals promenne ktere preda vsem views
// tyto budou existovat jen ve views ktere jsou renderovany
app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;

    // v kazdem POST formulari pak musi byt ten csrf Token uveden, name musi byt "_csrf"
    // <input type="hidden" name="_csrf" value="<%= csrfToken %>"> 
    res.locals.csrfToken = req.csrfToken();   
    next();        
} );


app.use( (req, res, next) => {
    console.log('');
    console.log('=============== new request ================');
    console.log('');
    next();
});




/* prihlaseni usera - registrujeme novy middleware abychom meli usera v requestech po cele app */
app.use( (req, res, next) => {
    // usera si vytahneme ze session pokud tam je
    if (!req.session.user) {
        return next();
    }
    
   User.findById(req.session.user._id).then(user => {
       throw new Error('baf');
        if (!user) { // do req. user pridat pokud ho fakt najdu
            return next();
        }
       /* req.user = user; muzeme takto rovnou protoze user je rovnou mongoose object */
       req.user = user;  
       next();
   }).catch(err => {
       // express.js error handling
       const error = new Error(err);
       error.httpStatusCode = 500;
       return next(error);
   });
} );




app.use('/admin', adminRoutes);  
app.use(shopRoutes);  // propada to -- pokud se nenajde cesta v shoproutes
app.use(authRoutes);  // tak hleda tady, pokud taky ne, pada dolu
app.get('/500', errorController.get500);
app.use(errorController.get404);  // sem

// error handling. -- specialni middleware co ma 4 argumenty
// Normalne by se sem nic nedostalo protoze mame nad tim app.use(errorController.get404)
// funkce s timhle middlewarem se automaticky zavola kdekoliv v aplikaci zavolame 
// next(error), tedy next() s error objektem jako argumentem
// pokud je error handleru takto definovano vic, jedou normalne odshora dolu
app.use( (error, req, res, next) => {
  //muzeme pouzit treba custom metody v error objectu:  
   // res.status(error.httpStatusCode).render(...)

    console.log(error);
    res.status(500).render('500', {
        pageTitle: '500 error',
        path: '/500',
        loggedIn: true,
        isAuthenticated : req.session.isAuthenticated
    });
} );

/* db connectnem pomoci mongoose do db se jmenem shop */
mongoose.connect(MONGODB_URI, {useNewUrlParser: true})

/* usera vytvorime zde kdyz spustime server pokud jiz neni vytvoren */
.then(result => {
    console.log('==== DB connected ====');
    app.listen(3000);
})
.catch(err => console.log(err))




