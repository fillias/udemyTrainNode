const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'login',
        path: '/login',
        isAuthenticated : req.session.isAuthenticated
    });
};

exports.postLogin = (req, res, next) => {

    // do odpovedi muzeme ulozit uzivateli cookie pomoci setHeader
    // res.setHeader('Set-Cookie', 'loggedIn=true'); ale pouzijeme session api

    // req.session.cokoliv = hodnota. 
    // nastavi session a zaroven ulozi session cookie
    // 'connect.sid' s hodnotou zahashovany chrchel - identifikuje bezpecne usera (instanci aplikace)
    // to je sparovano se session na serveru - jen na serveru jsou ulozena sensitive data 

    User.findById('5d11fb2bca15f63e6b0f3397')
    .then(user => {
        req.session.isAuthenticated = true;
        req.session.user = user;
        // console.log(req.body.email, req.body.password);
        // sejvneme session a az pak redirect - callback se zavola az kdyz je hotovo
        req.session.save( err => {
            res.redirect('/');
        });
        
    })
    .catch (err =>  console.log('postloginn err: ', err)) ;

};

exports.postLogout = (req, res, next) => {

    // zde zrusime vsechny session pomoci session metody destroy()
    // argument je callback co se zavola jakmile je hotovo
    req.session.destroy( (err) => {
        console.log(err);
        res.redirect('/');
    });   
};