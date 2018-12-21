const express = require('express');

const router = express.Router();

/* router.get post atd jako prvni argument bere exact match '/', use to bere jako ze to tim '/' zacina, 
** use '/' matchne tedy vsechny requesty */
router.get('/', (req, res, next) => {
    res.send('<h2>kuk</h2><a href = "/admin/add-product">goto add product</a>');
} );


module.exports = router;