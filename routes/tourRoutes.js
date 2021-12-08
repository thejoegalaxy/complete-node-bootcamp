const express = require('express');
//import tourController
const tourController = require('./../controllers/tourController');

const router = express.Router();

router.param('id',tourController.checkID);

// create a checkBody middleware function
// check if body contains the name and price property
// if not, send back 400 (bad request)
// Add it to the post handler stack.
router.param('name',tourController.checkBody);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.checkBody,tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;