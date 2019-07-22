const express = require('express');

// validace formularu serverside
const { check, body } = require('express-validator');

const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
  body('email').normalizeEmail().trim(),
  authController.postLogin);



// check() vraci middleware, to se pak preda dal do authController.postSignup
// check ocekava argumentuy v "name" poli v html formulari
// muzeme pridat (chainovat) spoustu veci jako message apod
// check('email').isEmail().withMessage('spatny mail hele');

// taky muzeme zde pouzit sanitatization - trim, normalize apod

router.post('/signup', 
    check('email').trim().normalizeEmail().isEmail().withMessage('spatny mail hele')
    // taky lze pridavat custom validace
    .custom((value, {req}) => {
        // if (value === 'test@test.com') {
        //     throw new Error ('zakazana email adresa');
        // }
        // // pokud neni podminka nahore splnena return true aby to pokracovalo
        // return true;


        // express-validator u custom() metody ocekava return true nebo false, nebo throw error a nebo promise
        // pokud je to promise, pocka na jeji fullfill nebo reject a az pak pokracuje
        // proto muzeme validovat i asynchronne pres promisu
        // a rovnou return , a tedy checknout v db zde zda user existuje

        return User.findOne({email: value})
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('email uz existuje');
          }
        });
    }), 

    check('password').trim().isLength({min:4}).withMessage('heslo minimalne 4 znaky'), 

    // taky lze pouzit body() ktere checkuje cele body requestu
    body('confirmPassword').trim()
    .custom( (value, {req}) => {
        if (value === req.body.password) {
            return true;
        }

        throw new Error ('password confirm nesouhlasi');

    }),

    authController.postSignup);



router.post('/logout', authController.postLogout);

router.get('/resetPwd', authController.getResetPwd);

router.post('/resetPwd', authController.postResetPwd);

// link z mailu uzivatele s vygenerovanym tokenem
router.get('/resetPwd/:token', authController.getNewPassword);

// post noveho hesla
router.post('/new-password', authController.postNewPassword);


module.exports = router;