const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  login,
  createUser,
  forgotPassword,
  resetPassword,
  getAllUsers,
  logoutUser,
} = require('../controllers/authController');

// Routes publiques
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', auth(), logoutUser);

// Routes protégées (Admin uniquement)
router.post(
  '/register',
  auth(['admin']),
  upload.single('photo'), 
  createUser
);
router.get('/users', auth(['admin']), getAllUsers);

module.exports = router;