const express = require('express');

const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router(); //mergeParams give us access to the tourId.

//protecting all the booking Routes.
router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.creatingBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
