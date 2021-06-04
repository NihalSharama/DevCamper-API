const express = require('express');
const {
  register,
  login,
  getMe,
  ForgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controlers/auth');
const { protect } = require('../middleware/auth');

//creating router
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', ForgotPassword);

router.get('/me', protect, getMe);
router.get('/logout', logout);

router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
