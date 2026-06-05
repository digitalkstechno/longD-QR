const express = require('express');
const router = express.Router();
const categorySLAController = require('../controllers/categorySLAController');

router.get('/', categorySLAController.getCategorySLAs);
router.get('/category/:categoryId', categorySLAController.getCategorySLAByCategoryId);
router.post('/', categorySLAController.createCategorySLA);
router.delete('/category/:categoryId', categorySLAController.deleteCategorySLA);

module.exports = router;
