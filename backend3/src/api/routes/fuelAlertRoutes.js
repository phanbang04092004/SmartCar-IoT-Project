// src/api/routes/fuelAlertRoutes.js
// MỚI - TẠO FILE NÀY

const express = require('express');
const router = express.Router();
const FuelAlertController = require('../controllers/fuelAlertController');

/**
 * @route   GET /api/fuel-alert
 * @desc    Kiểm tra mực xăng và cảnh báo + gợi ý trạm xăng nếu < 500
 * @access  Public
 * 
 * Response khi fuel >= 500:
 * {
 *   "success": true,
 *   "alert": false,
 *   "data": {
 *     "fuelLevel": 750,
 *     "status": "OK",
 *     "message": "Mực xăng ở mức bình thường"
 *   }
 * }
 * 
 * Response khi fuel < 500:
 * {
 *   "success": true,
 *   "alert": true,
 *   "data": {
 *     "warning": { ... },
 *     "currentLocation": { ... },
 *     "gasStations": [ ... ],
 *     "recommendation": "..."
 *   }
 * }
 */
router.get('/', FuelAlertController.checkFuelAndAlert);

module.exports = router;