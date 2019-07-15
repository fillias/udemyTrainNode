const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');


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


/* prihlaseni usera - registrujeme novy middleware abychom meli usera v requestech po cele app */
app.use( (req, res, next) => {
    // natvrdo se "prihlasime" jako user co jsme vytvorili pri startu serveru
   User.findById('5d11fb2bca15f63e6b0f3397').then(user => {
       /* req.user = user; muzeme takto rovnou protoze user je rovnou mongoose object */
       req.user = user;  
       next();
   }).catch(err => console.log(err));
} );


app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

/* db connectnem pomoci mongoose do db se jmenem shop */
mongoose.connect('mongodb+srv://fillias:vcosCilhCtMgstAm@cluster0-purr1.mongodb.net/shop?retryWrites=true', {useNewUrlParser: true})

/* usera vytvorime zde kdyz spustime server pokud jiz neni vytvoren */
.then(result => {
    /* findOne() mongoose metoda najde a vrati prvniho usera */
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'filip', 
                email: 'dfdf@fff.cz',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    })

    

    console.log('==== DB connected ====');
    app.listen(3000);
})
.catch(err => console.log(err))




