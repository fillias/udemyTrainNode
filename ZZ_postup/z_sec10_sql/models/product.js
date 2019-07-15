/* models zde -- v podstate to maji byt jen data */


const Cart = require('../models/cart');
/* ulozeni products do file storage */
const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');


const db = require('../util/database');

/* helper funkce - refactor */
const getProductsFromFile = callback => {
    fs.readFile(p, (err, fileContent) => {
        if (!err) {
            callback(JSON.parse(fileContent));
        } else {
            callback([]);
        }
    });
}


module.exports = class Product {
    /* vola se v v controllers/admin postAddProduct */
    /* pokud id existuje uz v produktu je, pokud ne, zada se v save() */
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        /* pokud existuje update v db */

        this.constructor.fetchAll().then( ([rows, metadata]) => {
           // console.log(rows);
        } )

        /* query je specifikovat into products (sloupce) VALUES (values)
        ** abychom se vyhnuli bezpecnostni issue "sql injection", pouzijem otazniky
        ** metoda execute vlozi misto otazniku hodnoty z pole v druhem argumentu
        ** (escapne to, zparsuje jako hidden sql commands a vyhodi je)
        ** db.execute returnem (promise) abychom mohli catchnout pripadny error
        ** id je doplneny automaticky jako prvni sloupec v mysql
        */
        return db.execute('INSERT into products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [this.title, this.price, this.imageUrl, this.description]);


        /* pokud neexistuje uloz do db novy */

    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id);
            const updatedProducts = products.filter(prod => prod.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }
  
    /* fetchAll pro vraceni vsech produktu */
    static fetchAll() {
       // db.execute vraci promisu
      return db.execute('SELECT * FROM products');

    }

    /* najdi produkt podle id a vrat promisu, nechame execute injectnout hodnotu id misto otazniku */
    static findById(id) {
       return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
    }

    /* test promise */
    static testPromise() {
        return new Promise( (resolve, reject) => {
            resolve('foo');
        } );
        
    }
};



