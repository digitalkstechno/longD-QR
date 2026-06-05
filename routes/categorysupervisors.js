const express = require('express');
const router = express.Router();
const categorySupervisorController = require('../controllers/categorySupervisorController');

router.get('/', categorySupervisorController.getCategorySupervisors);
router.get('/category/:categoryId', categorySupervisorController.getCategorySupervisorByCategoryId);
router.post('/', categorySupervisorController.createCategorySupervisor);
router.delete('/category/:categoryId', categorySupervisorController.deleteCategorySupervisor);

module.exports = router;
