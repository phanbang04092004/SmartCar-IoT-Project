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
            health: '/api/health'
        }
    });
});

const vehicleRoutes = require('./routes/vehicleRoutes');

router.use('/vehicle', vehicleRoutes);

module.exports = router;