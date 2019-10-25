const express = require('express');

const path = require('path');

const router = express.Router();

const rootDir = require('../util/path');

router.get('/', (req, res, next) => {
    /* u sendFile je treba pouzit absolutni path 
    ** nelze toto: res.sendFile('/views/shop.html');  protoze '/' znaci root directory
    ** takze pouzijem node path.join() ktery vytvori spravne cestu jak na linux tak windows
    ** __dirname je globalvar jejiz hodnota je absolutni cesta systemu do tohoto folderu
    ** tedy v tomhle pripade "C:\www\udemyTrainNode\routes"  
    */

   /* vytvorime absolutni cestu takto 
    ** res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
    ** ale lepe pomoci helper funkce */
   res.sendFile(path.join(rootDir, 'views', 'shop.html') );
} );


module.exports = router;