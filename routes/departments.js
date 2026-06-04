const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// Public endpoint so the submit-query form can fetch departments
router.get('/', departmentController.getDepartments);
router.get('/:id', protect, departmentController.getDepartmentById);

router.post('/', protect, authorize('Admin'), departmentController.createDepartment);
router.put('/:id', protect, authorize('Admin'), departmentController.updateDepartment);
router.delete('/:id', protect, authorize('Admin'), departmentController.deleteDepartment);

module.exports = router;
