const express = require('express');
const router  = express.Router();
const adminAuth = require('../middlewares/adminAuth.middleware');
const {
  listAll, getOne, create, update, toggle, previewUrl,
} = require('../controllers/admin_offer_wall.controller');

router.use(adminAuth);


router.get('/', listAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id/toggle', toggle);
router.post('/:id/preview-url', previewUrl);

module.exports = router;
