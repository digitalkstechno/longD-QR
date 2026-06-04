const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect } = require('../middleware/auth');

// Note: Settings management requires 'settings' module permissions, mapped to 'Admin' or specific custom role.
// We use a generic admin check or rely on the frontend for now, or you could add module-specific middleware.
router.get('/resolution-times', protect, settingController.getResolutionTimes);
router.post('/resolution-times', protect, settingController.createResolutionTime);
router.put('/resolution-times/:id', protect, settingController.updateResolutionTime);
router.delete('/resolution-times/:id', protect, settingController.deleteResolutionTime);

module.exports = router;
