const TrackingService = require('../../services/trackingService');

class LocationController {
    /**
     * GET /api/locations
     * Lấy lịch sử vị trí theo thời gian
     * Query params: startTime, endTime, limit
     */
    static async getLocations(req, res) {
        try {
            const { startTime, endTime, limit } = req.query;
            const limitNum = limit ? parseInt(limit) : 100;
            if (limitNum > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit không được vượt quá 1000'
                });
            }
            const locations = await TrackingService.getLocationHistory(
                startTime,
                endTime,
                limitNum
            );
            res.json({
                success: true,
                count: locations.length,
                data: locations,
                query: { startTime, endTime, limit: limitNum }
            });

        } catch (error) {
            console.error('Error in getLocations:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu vị trí',
                error: error.message
            });
        }
    }

    /**
     * GET /api/locations/current
     * Lấy vị trí hiện tại (mới nhất)
     */
    static async getCurrentLocation(req, res) {
        try {
            const location = await TrackingService.getCurrentLocation();

            if (!location) {
                return res.status(404).json({
                    success: false,
                    message: 'Chưa có dữ liệu vị trí'
                });
            }

            res.json({
                success: true,
                data: location
            });

        } catch (error) {
            console.error('Error in getCurrentLocation:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy vị trí hiện tại',
                error: error.message
            });
        }
    }

    /**
     * GET /api/locations/route
     * Lấy route (đường đi) trong khoảng thời gian để vẽ trên bản đồ
     * Query params: startTime (required), endTime (required)
     */
    static async getRoute(req, res) {
        try {
            const { startTime, endTime } = req.query;
            if (!startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'startTime và endTime là bắt buộc'
                });
            }
            const route = await TrackingService.getRouteData(startTime, endTime);
            res.json({
                success: true,
                count: route.length,
                data: route,
                query: { startTime, endTime }
            });

        } catch (error) {
            console.error('Error in getRoute:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu route',
                error: error.message
            });
        }
    }
}
module.exports = LocationController;