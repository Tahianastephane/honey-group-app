const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  login,
  createUser,
  deleteUser,
  updateUser,
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
 // Pour Delete et Update
router.put('/users/:id', auth(), upload.single('photo'), updateUser);
router.delete('/users/:id', auth(['admin']), deleteUser);


module.exports = router;