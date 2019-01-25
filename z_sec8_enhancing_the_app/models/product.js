/* models zde -- v podstate to maji byt jen data */

/* products zatim takto mock do variable, bude to ale v databazi */
//const products = [];

/* ulozeni products do file storage */
const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const p = path.join(rootDir, 'data', 'products.json');

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
    constructor(title, imageUrl, description, price) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {

        getProductsFromFile( (products) => {
            products.push(this);
           fs.writeFile(p, JSON.stringify(products));
        });

    }

    /* static se volaji primo na te classe a ne na tom objektu classou vytvorenem, pouziti pro utility funkce apod */
    /* fetchAll pro vraceni vsech produktu */
    static fetchAll(callback) {
        getProductsFromFile(callback);

    }

}