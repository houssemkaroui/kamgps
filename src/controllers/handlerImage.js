const multer = require("multer")
const path = require("path");
const fs = require("fs");
const crypto =require ("crypto")


//uplode images
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "image/jpeg") {
            //const folderName = path.join(__dirname.substring(0, 32) + '/' + 'photos')
            const folderName = `public/img/users`
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName);
            }
            cb(null, 'photos')
        }
    },
    filename: function (req, file, cb) {
        let hash = crypto.createHash('md5').update(file.originalname).digest('hex');
        cb(null, hash + '-' + Date.now() + path.extname(file.originalname))
    }
})


exports.upload = multer({ storage: storage })