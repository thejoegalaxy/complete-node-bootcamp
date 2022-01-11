const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     //passing local variables in the pug file.
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   }); //express will look for the template base in the views folder.
// });

//this will run for all other routes.
//put in the middleware stack for each and every route.
//changing to only call isLoggedIn for routes that aren't protected instead of every route.
//router.use(authController.isLoggedIn);
// noted add createBookingCheckout to '/' route because this is the route we'll hit on successful
// stripe processing. this is tempoary.
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
