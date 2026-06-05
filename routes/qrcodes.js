const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');

router.get('/', qrCodeController.getQRCodes);
router.get('/:id', qrCodeController.getQRCodeById);
router.get('/path/:path', qrCodeController.getQRCodeByPath);
router.post('/', qrCodeController.createQRCode);
router.put('/:id', qrCodeController.updateQRCode);
router.delete('/:id', qrCodeController.deleteQRCode);

module.exports = router;
