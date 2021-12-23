const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //mergeParams give us access to the tourId.
// POST /tour/234fad4/reviews
// POST /reviews
router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews) //protect the route.
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  ); //create;

module.exports = router;
