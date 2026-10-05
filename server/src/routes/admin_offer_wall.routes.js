const express = require('express');
const router  = express.Router();
const multer = require('multer');
const adminAuth = require('../middlewares/adminAuth.middleware');
const { logoStorage } = require('../config/cloudinary');
const { listAll, getOne, create, update, toggle, previewUrl, uploadLogo, } = require('../controllers/admin_offer_wall.controller');

router.use(adminAuth);

const upload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Only JPG, PNG or WEBP  images are allowed');
    err.status = 400;
    cb(err, false);
  },
});


// Must be declared before the '/:id' routes
router.post('/upload-logo', upload.single('logo'), uploadLogo);

router.get('/', listAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/toggle', toggle);
router.post('/:id/preview-url', previewUrl);

module.exports = router;
