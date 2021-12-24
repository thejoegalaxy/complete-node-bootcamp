const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//signup user.
router.post('/signup', authController.signup);
//login user.
router.post('/login', authController.login);

//forgot password, will receive email address.
router.post('/forgotPassword', authController.forgotPassword);

// reset password, will receive the token and new password.
router.patch('/resetPassword/:token', authController.resetPassword);

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

//updateMe
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
