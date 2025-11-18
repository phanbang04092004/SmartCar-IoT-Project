const express = require('express');
const locationRoutes = require('./routes/locationRoutes');

const router = express.Router();

// Mount routes
router.use('/locations', locationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Vehicle Tracking API is running',
        timestamp: new Date().toISOString()
    });
});

// API info
router.get('/', (req, res) => {
    res.json({
        message: 'Vehicle Tracking REST API',
        version: '1.0.0',
        endpoints: {
            locations: '/api/locations',
            currentLocation: '/api/locations/current',
            route: '/api/locations/route',
            vehicle: '/api/vehicle',
            fuelAlert: '/api/fuel-alert',
            health: '/api/health'
        }
    });
});

const vehicleRoutes = require('./routes/vehicleRoutes');
router.use('/vehicle', vehicleRoutes);

// Thêm route cho fuel alert
const fuelAlertRoutes = require('./routes/fuelAlertRoutes');
router.use('/fuel-alert', fuelAlertRoutes);

module.exports = router;