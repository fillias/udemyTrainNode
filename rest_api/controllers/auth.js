const User = require('../models/user');
const { validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');

// hesla chceme hashovat
const bcrypt = require('bcryptjs');

exports.signup = (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('auth validation failed, incorect data');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    
    const password = req.body.password;
    //heslo sahashujem silou 12
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                name: name,
                password: hashedPw
            });

            return user.save()
        })
        .then(result => {
            res.status(201).json({message: 'user created', userId: result._id});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;
    // existuje user?
    User.findOne({email: email})
        .then(user => {
            // pokud usera nenajde vraci to undefined
            if (!user) {
                const error = new Error('email nenalezen');
                error.status = 401;
                throw error;
            }
            loadedUser = user;
            // porovname zadane heslo a zahashovane heslo v db, 
            // vraci to promisu a ta vraci true pokud souhlasi
           return bcrypt.compare(password, user.password); 
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('heslo nesouhlasi');
                error.status = 401;
                throw error;
            }

            // pokud souhlasi email a heslo vytvorime "web token"
            //pomoci npm balicku "jsonwebtoken"

            // jwr.sign() vytvori novy signature token. 
            // do nej muzem hodit jakakoliv data
            // jako druhy argument je "secret" ktere zna jen server 
            // treti argument jsou props toho secretu
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString() // _id je mongodb ID proto toString()
            }, 'necoDesneTajnyho', { expiresIn: '1h' });

            res.status(200).json({token: token, userId: loadedUser._id.toString()})
            
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}