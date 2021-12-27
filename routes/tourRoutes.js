const express = require('express');
//import tourController
const tourController = require('../controllers/tourController');

const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
//const reviewController = require('../controllers/reviewController');

const router = express.Router();

//since routers are just middleware we can say when we encounter a route like this.
//use reviewRouter.

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router.route('/tour-stats').get(tourController.getTourStats);

// /tours-distance?distance=233,center=-40,45&unit=mi query string way.
// /tours-distance/233/center/-40,45/unit/mi parameters way, looks cleaner.
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  //.get(authController.protect, tourController.getAllTours) //protect the route.
  .get(tourController.getAllTours) //unprotect the route and expose this
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
