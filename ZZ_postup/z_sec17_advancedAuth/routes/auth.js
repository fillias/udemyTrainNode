const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/resetPwd', authController.getResetPwd);

router.post('/resetPwd', authController.postResetPwd);

// link z mailu uzivatele s vygenerovanym tokenem
router.get('/resetPwd/:token', authController.getNewPassword);

// post noveho hesla
router.post('/new-password', authController.postNewPassword);


module.exports = router;