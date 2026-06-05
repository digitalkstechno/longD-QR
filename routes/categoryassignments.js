const express = require('express');
const router = express.Router();
const categoryAssignmentController = require('../controllers/categoryAssignmentController');

router.get('/', categoryAssignmentController.getCategoryAssignments);
router.get('/category/:categoryId', categoryAssignmentController.getCategoryAssignmentByCategoryId);
router.post('/', categoryAssignmentController.createCategoryAssignment);
router.delete('/category/:categoryId', categoryAssignmentController.deleteCategoryAssignment);

module.exports = router;
