const TrackingService = require('../../services/trackingService');
const GasStationService = require('../../services/gasStationService');

const FUEL_THRESHOLD = 700;  // Ngưỡng cảnh báo
const SEARCH_RADIUS = 4000;  // Bán kính tìm kiếm: 4km

class FuelAlertController {
    

    static async checkFuelAndAlert(req, res) {
        try {
            console.log('🔍 Kiểm tra mực xăng...');

            // Bước 1: Lấy mực xăng mới nhất
            const [latestFuel] = await TrackingService.getFuelHistory(1);
            
            if (!latestFuel) {
                return res.status(404).json({
                    success: false,
                    message: 'Không có dữ liệu mực xăng'
                });
            }

            const fuelLevel = latestFuel.level;
            console.log(`⛽ Mực xăng hiện tại: ${fuelLevel}`);

            // Bước 2: Kiểm tra ngưỡng
            if (fuelLevel >= FUEL_THRESHOLD) {
                // Mực xăng OK
                return res.json({
                    success: true,
                    alert: false,
                    data: {
                        fuelLevel: fuelLevel,
                        status: 'OK',
                        message: 'Mực xăng ở mức bình thường',
                        timestamp: latestFuel.timestamp
                    }
                });
            }

            // Bước 3: Mực xăng THẤP - Cảnh báo
            console.log('⚠️ MỰC XĂNG THẤP! Tìm trạm xăng...');

            // Lấy vị trí hiện tại
            const currentLocation = await TrackingService.getCurrentLocation();
            
            if (!currentLocation) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy vị trí hiện tại'
                });
            }

            console.log(`📍 Vị trí: ${currentLocation.latitude}, ${currentLocation.longitude}`);

            // Bước 4: Tìm trạm xăng trong bán kính 4km
            const gasStations = await GasStationService.findNearestGasStations(
                currentLocation.latitude,
                currentLocation.longitude,
                SEARCH_RADIUS,
                10
            );

            console.log(`✅ Tìm thấy ${gasStations.length} trạm xăng`);

            // Bước 5: Trả về kết quả
            return res.json({
                success: true,
                alert: true,
                data: {
                    // Thông tin cảnh báo
                    warning: {
                        message: `🚨 CẢNH BÁO: Mực xăng chỉ còn ${fuelLevel}!`,
                        fuelLevel: fuelLevel,
                        threshold: FUEL_THRESHOLD,
                        severity: fuelLevel < 200 ? 'CRITICAL' : 'WARNING'
                    },
                    
                    // Vị trí hiện tại
                    currentLocation: {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        timestamp: currentLocation.timestamp
                    },
                    
                    // Danh sách trạm xăng
                    gasStations: gasStations.map(station => ({
                        id: station.id,
                        name: station.name,
                        brand: station.brand,
                        address: station.address,
                        distance: station.distance,
                        distanceText: station.distanceText,
                        travelTime: station.travelTime,
                        latitude: station.latitude,
                        longitude: station.longitude,
                        googleMapsUrl: station.googleMapsUrl,
                        phone: station.phone,
                        fuelTypes: station.fuel_types
                    })),
                    
                    // Gợi ý - SỬA: dùng FuelAlertController thay vì this
                    recommendation: FuelAlertController.generateRecommendation(fuelLevel, gasStations),
                    
                    // Metadata
                    searchRadius: SEARCH_RADIUS,
                    totalStationsFound: gasStations.length
                }
            });

        } catch (error) {
            console.error('❌ Lỗi kiểm tra mực xăng:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    /**
     * Tạo gợi ý dựa trên mực xăng và trạm gần nhất
     */
    static generateRecommendation(fuelLevel, stations) {
        if (stations.length === 0) {
            return '⚠️ Không tìm thấy trạm xăng trong bán kính 4km. Hãy tìm kiếm xa hơn hoặc sử dụng bản đồ.';
        }

        const nearest = stations[0];
        
        if (fuelLevel < 200) {
            return `🚨 KHẨN CẤP: Đi ngay đến "${nearest.name}" (${nearest.distanceText}, ~${nearest.travelTime} phút). Xe có thể hết xăng bất cứ lúc nào!`;
        } else if (fuelLevel < 300) {
            return `⚠️ Nên đổ xăng sớm tại "${nearest.name}" (${nearest.distanceText}, ~${nearest.travelTime} phút).`;
        } else {
            return `💡 Trạm xăng gần nhất: "${nearest.name}" (${nearest.distanceText}). Có ${stations.length} trạm trong bán kính 4km.`;
        }
    }
}

module.exports = FuelAlertController;