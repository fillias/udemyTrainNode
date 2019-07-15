const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

/* importnem adminData  */
const adminData = require('./admin.js');



router.get('/', (req, res, next) => {
  const products = adminData.products;
  console.log('adminData.products: ', adminData.products);
  res.render('shop', {
    pageTitle: 'shopik',
    path: '/',
    prods: products,
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true
  });
  // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
