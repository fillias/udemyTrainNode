const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

const errorController = require('./controllers/error');

const multer = require('multer');

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


// multer je middleware ktery se podiva do kazdeho requestu jestli je to multipart form data
// a pokud to tak je tak se pokusi ty data extractnout
// single mu rekne ze je to jen jeden file a 'image' je ten input name ktery ma hledat
// multer bere options v {}, ,kde 'dest' je folder kam to ma uploadnout
// v defaultu tomu uploadlemu binary data da nejaky random hash name
// lepsi je pouzit multer 'diskStorage' ktery se preda jako storage

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
        cb(null, new Date().toISOString() + '_' + file.originalname );
    }
});

// filefilter umoznuje konfigurovat co chceme ukladat
const fileFilter = (req, file, cb) => {
    //console.log(file);
    
    // cb(null, true) -- zavolat pokud soubor chceme ulozit
    // cb(null, false) -- zavolat pokud soubor nechceme ulozit
    if (file.mimetype === 'image/png' || file.mimetipe === 'image/jpeg' || file.mimetipe === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(multer({
  //  dest: 'images'
  storage: fileStorage,
  fileFilter: fileFilter
}).single('image'));

// static znamena ze requesty na files z definovane routy a folderu budou automaticky vydany (vsem)
// expressu rikame: "serve files in that folder jako by byly v root folderu"
app.use(express.static(path.join(__dirname, 'public')));

// pokud maji cestu jinou, uvedem ji
// jestli mame request co zacina "/images" pak serviruj tyhle files staticly
// '/images' je ten folder ktery chceme tohle servirovat
app.use('/images', express.static(path.join(__dirname, 'images')));

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
    // csurf package se pro token diva do body, do query a do headers
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




