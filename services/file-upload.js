const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

//Configures the AWS connection
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-1'
});

const s3 = new aws.S3();

//Filters the file to make sure it can be uploaded properly
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only jpeg and png can be uploaded!'), false);
    }
}


//Creates the upload function
const upload = multer({
    fileFilter,
    storage: multerS3({
        // acl: 'public-read',
        s3,
        bucket: function(req, res, cb) {
            cb(null, `pokemon-challenges/${req.body.type}`)
        },
        // `pokemon-challenges/${req.body.type}`,
        metadata: function(req, file, cb) {
            cb(null, {fieldname: 'TESTING_METADATA'});
        },
        key: function(req, file, cb) {
            const fileType = file.mimetype === 'image/jpeg' ? 'jpeg' : 'png';
            const numModifier = Math.floor((Math.random() * 151) +1);
            cb(null, `${req.body.name}${numModifier}.${fileType}`);
        }
    })
})

module.exports = upload;