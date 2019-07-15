const User = require('../models/user');

// pro posilani mailu pres sendgrid
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// nodemaileru createTransport() je treba nastavit jak bude dorucovat maily 
// nastavime mu sendgridTransport() ktera vrati konfiguraci kterou precte nodemailer
const transporter = nodemailer.createTransport( sendgridTransport({
  auth: {
     api_key: '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'
  }
}) );


// pouzijeme bcryptjs pro zahashovani hesel
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
 // console.log(req.flash('error').length);
 // po prvnim pouziti req.flash() se tento zahodi
 const errMsg = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',

    // req.flash bude populated pokud se preda z predchoziho requestu
    // pokud se pouzije pak se ze session zahodi
    // pokud flash nic nema vraci prazdnou array
    errorMessage: errMsg.length == 0 ? undefined : errMsg
  });
};

exports.getSignup = (req, res, next) => {
  const errMsg = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: errMsg.length == 0 ? undefined : errMsg
  });
};

exports.postLogin = (req, res, next) => {
  // usera pri loginu hledame podle emailu
  const email = req.body.email;
  
  const password = req.body.password;
  User.findOne({email: email})
    .then(user => {

      // pokud nemam usera redirectnu
      if (!user) {
        // flash() metoda pridana do req objektu pomoci connect-flash
        // preda custom info do dalsiho requestu pomoci session, 
        // jakmile se v nejakem requestu nasledne pouzije tak se zahodi
        // prvni argument je klic, druha je hodnota co se preda
        req.flash('error', 'spatny email nebo heslo');
        return res.redirect('/login');
      }

      //validate password
      // bcrypt vytvoril ten hash z passwordu pri signupu 
      // a tak jen bcrypt muze porovnavat jestli ten hash souhlasi s tim passwordem
      // bcrypt.compare(string, hashedString), vraci promisu
      // pokud vrati error, neznamena to ze ty porovnani nematchly/matchly jen se neco pokazilo

      bcrypt.compare(password, user.password)
      .then(doMatch => {
        // tady porovname, vraci se boolean 
        if (doMatch) {
          req.session.isAuthenticated = true;
          req.session.user = user;
          
          // req.session.save musime return aby se nevykonal kod podtim
          // ( res.redirect('/') v save() se udela asynchronne a je to cb v jine funkci )
          return req.session.save(err => {
            if (err) {console.log('req.session.save() err', err);}
            res.redirect('/');
          });
        } 
        req.flash('error', 'spatny email nebo heslo');
        return res.redirect('/login');        

      })
      .catch(err => {
        // neco se pokazilo
        console.log(err);
        res.redirect('/login');
      });

      
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // nejdrive zkusime jestli ten user uz neexistuje
  // pokud ano tak rovnou redirectnem
  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'email uz existuje');
      return res.redirect('/signup');
    }

    // pokud neexistuje uzivatel, vytvorime

    // bcrypt hash asynchrone hashuje string, vraci promisu, druhy argument "salt" 
    //-- v podstate kolik rounds of hashing bude pouzito, 
    // cim vic tim dele to trva a je to bezpecnejsi, 12 se ted pouziva jako high secure
    // neda se to decryptnout
    return bcrypt.hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: {items: []}
        });
    
        return user.save();
      })
      .then(result => {
        res.redirect('/login');
        // pop redirectu posleme email uzivateli
        // transporter vraci promisu
        return transporter.sendMail({
          to: email,
          // from musi byt email adresa
          from: 'udemyTrainNode@testik.com',
          subject: ' Signupt succeeded',
          // html je telo emailu
          html: '<h4>zaregistrovano</h4>'
        });
        
      });
  })
  .catch(err => console.log(err));


};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
