/* helper pro reseni cest */

const path = require('path');

/* dirname vraci directory name of a path */
/*  process.mainModule.filename v vrati root directory aplikace */
module.exports = path.dirname(process.mainModule.filename);