const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
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
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
// /login route.

module.exports = router;
