const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //mergeParams give us access to the tourId.
// POST /tour/234fad4/reviews
// POST /reviews

// GET /tour/234fad4/reviews
// Get all reviews for a particular tour.

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews) //protect the route.
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  ); //create;

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview); //delete

module.exports = router;
