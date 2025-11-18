const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');


router.get('/', LocationController.getLocations);
router.get('/current', LocationController.getCurrentLocation);
router.get('/route', LocationController.getRoute);

module.exports = router;