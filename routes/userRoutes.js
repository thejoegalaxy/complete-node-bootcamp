const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//like a mini application
const router = express.Router();

//signup user.
router.post('/signup', authController.signup);
//login user.
router.post('/login', authController.login);
//forgot password, will receive email address.
router.post('/forgotPassword', authController.forgotPassword);
// reset password, will receive the token and new password.
router.patch('/resetPassword/:token', authController.resetPassword);

//since this middleware will run in order.
// protect all the routes that come after this point.
// so we can remove authController.protect from the below.
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
//updateMe
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/updateMyPassword', authController.updatePassword);

//below routes are admin restricted.
router.use(authController.restrictTo('admin', 'lead-guide'));

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
