const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews) //protect the route.
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  ); //create;

module.exports = router;
