const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');

// Route
router.get('/status', VehicleController.getCurrentStatus);
router.get('/fuel-history', VehicleController.getFuelHistory);
router.get('/trunk-history', VehicleController.getTrunkHistory);
router.get('/route', VehicleController.getRoute);

module.exports = router;
