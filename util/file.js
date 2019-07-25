const fs = require('fs');

const deleteFile = (filePath) => {

    // unlink = delete
    fs.unlink(filePath, (err) => {
        if (err) {
            throw new Error(err);
        }
    });
}

exports.deleteFile = deleteFile;