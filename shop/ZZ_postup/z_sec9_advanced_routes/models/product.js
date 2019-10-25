/* models zde -- v podstate to maji byt jen data */


const Cart = require('../models/cart');
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
    /* pokud id existuje uz v produktu je, pokud ne, zada se v save() */
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        /* pokud zavolam save tak zjisti jestli id uz existuje 
         ** pokud ano, update existujici, pokud ne, vytvor novy */
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(
                    prod => prod.id === this.id
                );
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    console.log(err);
                });
            } else {
                /* kazdy produkt musi mit svoje uniq id abychom ho mohli mazat / edit etc */
                /* prozatim jen jako math random */
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err);
                });
            }
        });
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
    /* static se volaji primo na te classe a ne na tom objektu classou vytvorenem, pouziti pro utility funkce apod */
    /* fetchAll pro vraceni vsech produktu */
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    /* najdi produkt podle id a zavolej s nim callback */
    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
};



