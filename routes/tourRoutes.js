const express = require('express');
//import tourController
const tourController = require('../controllers/tourController');

const authController = require('../controllers/authController');

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

module.exports = router;
