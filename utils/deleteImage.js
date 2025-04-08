// const fs = require('fs');
// const path = require("path");
// module.exports.deleteImage = (fileName) => {
//     const rootPath = path.dirname(require.main.filename);
//     const deletePath = `${rootPath}/${fileName}`;
//     console.log(deletePath);
//     fs.rmSync(deletePath);

// }
// const fs = require('fs');
const path = require("path");
const fs = require("fs");

module.exports.deleteImage = (filePaths) => {
    filePaths.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the file
                // console.log(`Deleted file: ${filePath}`);
            } else {
                console.log(`File not found: ${filePath}`);
            }
        } catch (error) {
            console.error(`Error deleting file ${filePath}:`, error.message);
        }
    });
};
