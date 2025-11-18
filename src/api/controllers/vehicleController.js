const TrackingService = require('../../services/trackingService');

class VehicleController {

  // 1️⃣ Lấy trạng thái hiện tại (vị trí, xăng, cốp)
  static async getCurrentStatus(req, res) {
    try {
      const location = await TrackingService.getCurrentLocation();
      const fuelRows = await TrackingService.getFuelHistory(1);
      const trunkRows = await TrackingService.getTrunkHistory(1);

      if (!location) return res.status(404).json({ success: false, message: 'Không có dữ liệu' });

      const vehicle = {
        timestamp: location.timestamp,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        fuelLevel: fuelRows[0]?.level ?? null,
        trunkStatus: trunkRows[0]?.status ?? null
      };

      // Tính alert
      const alerts = [];
      if (vehicle.fuelLevel !== null && vehicle.fuelLevel < 500) alerts.push('Cảnh báo: Mực xăng thấp');
      if (vehicle.trunkStatus === 1) alerts.push('Cảnh báo: Cốp đang mở');

      res.json({ success: true, vehicle, alerts });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2️⃣ Lấy lịch sử mực xăng
  static async getFuelHistory(req, res) {
    try {
      const { startTime, endTime, limit } = req.query;
      const rows = await TrackingService.getFuelHistory(limit || 100, startTime, endTime);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3️⃣ Lấy lịch sử cốp
  static async getTrunkHistory(req, res) {
    try {
      const { startTime, endTime, limit } = req.query;
      const rows = await TrackingService.getTrunkHistory(limit || 100, startTime, endTime);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 4️⃣ Lấy route di chuyển
  static async getRoute(req, res) {
    try {
      const { startTime, endTime } = req.query;
      if (!startTime || !endTime) return res.status(400).json({ success: false, message: 'startTime và endTime bắt buộc' });

      const route = await TrackingService.getRouteData(startTime, endTime);
      res.json({ success: true, route });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = VehicleController;
