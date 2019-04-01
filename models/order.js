const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* order je related k many products a jednomu user

*/
const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    }
});

module.exports = Order;