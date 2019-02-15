const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* v sequelize nejdriv definujeme model tabulky
** docka je sequelize.com
  
prvni argument je jmeno
druhy je struktura

*/
const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = Product;