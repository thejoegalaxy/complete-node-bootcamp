const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     //passing local variables in the pug file.
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   }); //express will look for the template base in the views folder.
// });

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
// /login route.

module.exports = router;
