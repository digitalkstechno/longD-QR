const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Seed default admin on startup
authController.seedAdmin();

// Login API
router.post('/login', authController.login);

module.exports = router;
