const express = require('express');

const router = express.Router();

const User = require('../models/user');

const authController = require('../controllers/auth');

const { body } = require('express-validator');

// uzivatele vzdy vytvarime unikatni, proto put
router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('please enter valid email')
        // zjistime jestli email uz neexistuje

        .custom((value, {req}) => {
        // custom() metoda ocekava funkci jako argument
        // kde jako jeji prvni argument je value - to je ta retrieved value
        // a pak objekt ve kterem muzeme extrahovat request pomoci destructuring {req}
        // navratova hodnotu nastavit na true pokud je validni nebo na promise

        // priklad dalsiho pouziti
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
            // pokud user existuje tak reject jinak to normalne pokracuje
            .then(userDoc => {
            if (userDoc) {
                return Promise.reject('email uz existuje');
            }
        });
    })
    .normalizeEmail(), 
    // zde dalsi polozky v array validatoru
    
    body('password')
        .trim()
        .isLength({min: 2}),

    body('name')
        .trim()
        .not().isEmpty()
    
], authController.signup );


router.post('/login', authController.login);

module.exports = router;
