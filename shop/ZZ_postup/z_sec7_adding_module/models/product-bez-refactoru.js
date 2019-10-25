/* models zde -- v podstate to maji byt jen data */

/* products zatim takto mock do variable, bude to ale v databazi */
//const products = [];

/* ulozeni products do file storage */
const fs = require('fs');
const path = require('path');
const rootDir = require('../util/path');
const products = [];

module.exports = class Product {

    constructor(title) {
        this.title = title;
    }



    /* touto metodou chci ulozit produkt do pole */
    save() {
        /* this jednoduse odkazuje na objekt vytvoreny touto classou */
        // products.push(this);

        const p = path.join(rootDir, 'data', 'products.json');
        /* abych mohl pripsat dalsi produkt, nejdriv musim vytahnout ty co uz jsou tam ulozeny */
        /* pro vetsi files je vhodne pouzit fs.readFileStream */
        fs.readFile(p, (err, fileContent) => {

            let products = [];
            /* pokracuj pokud file existuje (err bude null) */
            if (!err) {
                products = JSON.parse(fileContent);
            }
            /* pozor, je treba v tom readFile pouzit arrou function, jinak nebude this reference k ty classe */
            /* novy produkt pushnem bud do nove array pokud jeste zadna neni ulozena */
            products.push(this);

            /* po vlozeni noveho produktu prepiseme puvodni file */
            fs.writeFile(p, JSON.stringify(products));


        });

    }

    /* static se volaji primo na te classe a ne na tom objektu classou vytvorenem, pouziti pro utility funkce apod */
    /* fetchAll pro vraceni vsech produktu */
    static fetchAll(callback) {
        const p = path.join(rootDir, 'data', 'products.json');

        /*  takto to nelze, fs je async a fetchAll vrati undefined nez se async vykona */
        /*
        fs.readFile(p, (err, fileContent) => {
            if (!err) {
                return JSON.parse(fileContent);
            } else {
                return [];
            }
        });
        */

        /* je treba pouzit callback */
        fs.readFile(p, (err, fileContent) => {
            if (!err) {
                callback(JSON.parse(fileContent));
            } else {
                callback([]);
            }
        });

    }

}