const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminAuthMiddleware = require('../middlewares/adminAuth.middleware');
const { manualReverse, manualUndo, bulkReverse } = require('../controllers/reversal.controller');

const upload = multer({
  dest: path.join(__dirname, '../../uploads/temp/'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .txt files allowed'));
    }
  }
});

router.use(adminAuthMiddleware);

router.post('/manual', manualReverse);
router.post('/undo', manualUndo);
router.post('/bulk', upload.single('file'), bulkReverse);

module.exports = router;