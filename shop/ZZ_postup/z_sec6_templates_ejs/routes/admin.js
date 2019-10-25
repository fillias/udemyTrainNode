const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

/* pripravime promennou pro ulozeni produktu 
** je to jen pro ukazku sdileni dat, takto se to nedela
** ta promenna products vcetne hodnot je pak ulozena pro cely nodejs server 
** a tedy napriklad sdilena s uplne jinym uzivatelem (cross users )
*/
const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
  res.render('add-product', {
    pageTitle: 'pridej produkt',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  console.log(req.body);
  products.push({title: req.body.title});
  res.redirect('/');
});

/* zmena syntaxe - exportuju vic veci */
/* module.exports = router;  */
exports.routes = router;
exports.products = products;