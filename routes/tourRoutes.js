const express = require('express');
//import tourController
const tourController = require('../controllers/tourController');

const authController = require('../controllers/authController');

const reviewController = require('../controllers/reviewController');

const router = express.Router();

//router.param('id',tourController.checkID);

// create a checkBody middleware function
// check if body contains the name and price property
// if not, send back 400 (bad request)
// Add it to the post handler stack.
//router.param('name',tourController.checkBody);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours) //protect the route.
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// nested route.  clear parent child relationship
//doing it this way will have the tourid in the url and the userid will be the current user logged in.
// reviews is clearly a child of tours.
// GET /tour/234fad4/reviews/djdjs
// Created a Review route in the Tour router so that
// a review can be created on a route.
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
