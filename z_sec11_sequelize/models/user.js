const Sequelize = require('sequelize');
const sequelize = require('../util/database');

/* v sequelize nejdriv definujeme model tabulky
** docka je sequelize.com
  
prvni argument je jmeno
druhy je struktura

*/
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        alowNull: false,
        primaryKey: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING
});

module.exports = User;