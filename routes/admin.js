const express = require('express');

const router = express.Router();

//  /admin/add-product  -> GET request
router.get('/add-product', (req, res, next) => {
    res.send('<html><body><form action="/admin/add-product" method ="POST"><input type="text" name="title"><button type="submit">add product</button></form></body></html>');
});

//  /admin/add-product  -> POST request
router.post('/add-product', (req, res, next) => {

    console.log(req.body);
    res.redirect('/');
});

module.exports = router;