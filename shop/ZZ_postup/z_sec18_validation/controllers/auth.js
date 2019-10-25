const User = require('../models/user');
const crypto = require('crypto');

// pro posilani mailu pres sendgrid
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator');



// nodemaileru createTransport() je treba nastavit jak bude dorucovat maily 
// nastavime mu sendgridTransport() ktera vrati konfiguraci kterou precte nodemailer

let transporter;
// API klic precist z environment variable

transporter = nodemailer.createTransport( sendgridTransport({
  auth: {
      api_key: process.env.SENDGRID_API_KEY
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
    validationErrors: [],
    oldInput: {email: '', password: ''},

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
    // 1st time load nemame oldInput ani validation errors
    oldInput: {email: '', password: '', confirmPassword: ''},
    validationErrors: [],

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
       // req.flash('error', 'spatny email nebo heslo');
        return res.status(422).render('auth/login', {
          // co tam uzivatel napsal mu tam ale vratime
          path: '/login',
          pageTitle: 'Login',
          oldInput: {email: email, password: password},
          // pridame i celou array of errors napriklad pro pridani class -- zvyrazneni chybnych poli
          validationErrors: [{param:'email'}],
          errorMessage: 'email neexistuje'
        });
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
       // req.flash('error', 'spatny email nebo heslo');
        // return res.redirect('/login');    
        
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          // co tam uzivatel napsal mu tam ale vratime
          oldInput: {email: email, password: password},
          // pridame i celou array of errors napriklad pro pridani class -- zvyrazneni chybnych poli
          validationErrors: [{param:'password'}],
          errorMessage: 'spatne heslo'
        });

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

  // errors ktere vrati middleware check() validace v routes
  const errors = validationResult(req);
  //console.log(errors);
  // je tam metoda isEmpty() vraci bool
  if (!errors.isEmpty()) {
    //console.log(errors.array());
    // pokud jsou ve formulari chyby, vrat status 422 a znovu signup
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      // co tam uzivatel napsal mu tam ale vratime
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
      // pridame i celou array of errors napriklad pro pridani class -- zvyrazneni chybnych poli
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg
    });
  }
  
    // bcrypt hash asynchrone hashuje string, vraci promisu, druhy argument "salt" 
    //-- v podstate kolik rounds of hashing bude pouzito, 
    // cim vic tim dele to trva a je to bezpecnejsi, 12 se ted pouziva jako high secure
    // neda se to decryptnout
  bcrypt.hash(password, 12)
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
    // po redirectu posleme email uzivateli 

    // transporter vraci promisu
    // u largescale app by e to spis melo resit nejakym serverside scriptem
    // ktery posle jednou za case emaily nove registrovanym
    return transporter.sendMail({
      to: email,
      // from musi byt email adresa
      from: 'udemyTrainNode@testik.com',
      subject: ' Signupt succeeded',
      // html je telo emailu
      html: '<h4>zaregistrovano</h4>'
    })
    .then(result => {
      console.log(result);
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

exports.getResetPwd = (req, res, next) => {
  // password reset
  const errMsg = req.flash('error');
  res.render('auth/resetPwd', {
    path: '/resetPwd',
    pageTitle: 'Reset password',
    errorMessage: errMsg.length == 0 ? undefined : errMsg
  });
};

exports.postResetPwd = (req, res, next) => {
  // pri resetu hesla chceme poslat unikatni token uzivateli do mailu aby se identifikoval
  // node js ma build-in knihovnu 'crypto' 
  // - ta se da mimo jine pouzit pro vytvoreni secure unique random values

  // randombytes vygeneruje nahodne bajty, a zavola callback
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      return res.redirect('/');
    }
    //console.log(buffer);
    // buffer je <buffer> hex Number, prevedeme na string - hex prevedeme na normalni ASCII
    const token = buffer.toString('hex');
    //console.log(token);

    // najdeme usera v db podle mailu req.body.email je z resetPwd.ejs

    User.findOne({email: req.body.email})
    .then(user => {

      if (!user) {
        req.flash('error', 'email neexistuje');
        return res.redirect('/resetPwd');
      }

      // pokud email existuje tak tomu userovi nastavime resetToken
      // a resetTokenExpiration na 1hodinu (v ms)

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + ( 1000 * 60 * 60 )

      user.save()
          .then(result => {
              res.redirect('/login');
              return transporter.sendMail({
                to: req.body.email,
                from: 'udemyTrainNode@testik.com',
                subject: 'reset pwd',
                html: `<a href = "http://192.168.56.102:3000/resetPwd/${token}">resetni password</a>`
              })
          })
          .then(result => {
           // console.log(result);
          }).catch(err => {
            console.log(err);
          });

    }).catch(err => {
      console.log(err);
    });

  });
}


exports.getNewPassword = (req, res, next) => {

  const token = req.params.token;

  // checknem token pokud existuje a pokud je Token expiration $gt jako "greater than" now
  // (nastavili jsme tokenu platnost 1 hodinu v postResetPwd() )
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
  .then(user => {

      if (user) {
        // pokud findOne nic nenajde vraci null
        const errMsg = req.flash('error');
        return res.render('auth/new-password', {
          path: '/new-password',
          pageTitle: 'New password',
          // pridame user id abychom ho mohli v naslednym post requestu pouzit
          userId: user._id.toString(),
          passwordToken: req.params.token,
          errorMessage: errMsg.length == 0 ? undefined : errMsg
        }); 

      } else {
        req.flash('error', 'neexistujici token');
        return res.redirect('/login');
      }
       
  }).catch(err => {
    console.log(err);
  }); 
}


// http://192.168.56.102:3000/resetPwd/fab3dc29d9c7b6ef3855b133ef7d10d01d834f64d1d106a3f347c3c082982028
// vytvoreni noveho hesla po kliku na reset pwd a kliku z mailu s tokenem
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  //console.log(newPassword);
  const passwordToken = req.body.passwordToken;
  //  token predavame v route '/resetPwd/:token' do view jako hidden <input>
  //console.log(passwordToken);

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(user => {
    if (user) {  
      resetUser = user;
      return bcrypt.hash(newPassword, 12)   
    }
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();   
  })
  .then(result => {
    return res.redirect('/login');
  })
  .catch(err => console.log(err));

}