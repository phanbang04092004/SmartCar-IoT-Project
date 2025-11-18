const mqttClient = require('../config/mqtt');
const TrackingService = require('./trackingService');
const GasStationService = require('./gasStationService');
require('dotenv').config();

const FUEL_ALERT_THRESHOLD = 700; // Ngưỡng cảnh báo mực xăng

class MqttService {
    static init() {
        const topic = process.env.MQTT_TOPIC;
        mqttClient.on('connect', () => {
            mqttClient.subscribe(topic, { qos: 1 }, (err) => {
                if (!err) {
                    console.log(`Đã subscribe topic: "${topic}"`);
                } else {
                    console.error('Lỗi subscribe topic:', err.message);
                }
            });
        });
        mqttClient.on('message', async (receivedTopic, message) => {
            const payload = message.toString();
            console.log('═══════════════════════════════════════════════════');
            console.log(`Nhận dữ liệu từ topic: ${receivedTopic}`);
            console.log(`Payload: ${payload}`);

            const parsedData = TrackingService.parseTrackingData(payload);

            if (!parsedData) {
                console.log('Bỏ qua dữ liệu không hợp lệ');
                console.log('═══════════════════════════════════════════════════\n');
                return;
            }

            console.log('Dữ liệu đã parse thành công:');
            console.log(JSON.stringify(parsedData, null, 2));

            const saved = await TrackingService.saveTrackingData(parsedData);

            if (saved && global.io) {
                console.log('Hoàn tất xử lý dữ liệu và phát qua Socket.io');

                const vehicle = {
                    timestamp: parsedData.timestamp,
                    location: parsedData.location,  // { latitude, longitude }
                    fuelLevel: parsedData.fuelLevel,
                    trunkStatus: parsedData.trunkStatus
                };

                const alerts = [];
                if (vehicle.fuelLevel < 20) alerts.push('Cảnh báo: Mực xăng thấp');
                if (vehicle.trunkStatus === 1) alerts.push('Cảnh báo: Cốp đang mở');

                // Kiểm tra mực xăng và tìm trạm xăng nếu thấp
                let fuelAlert = null;
                if (vehicle.fuelLevel < FUEL_ALERT_THRESHOLD) {
                    console.log(`⚠️ MỰC XĂNG THẤP (${vehicle.fuelLevel})! Đang tìm trạm xăng gần nhất...`);
                    
                    try {
                        const gasStations = await GasStationService.findNearestGasStations(
                            vehicle.location.latitude,
                            vehicle.location.longitude,
                            4000, // Bán kính 4km
                            5     // Tối đa 5 trạm
                        );

                        if (gasStations.length > 0) {
                            fuelAlert = {
                                fuelLevel: vehicle.fuelLevel,
                                threshold: FUEL_ALERT_THRESHOLD,
                                severity: vehicle.fuelLevel < 200 ? 'CRITICAL' : 'WARNING',
                                nearestStation: {
                                    name: gasStations[0].name,
                                    distance: gasStations[0].distanceText,
                                    travelTime: gasStations[0].travelTime,
                                    googleMapsUrl: gasStations[0].googleMapsUrl
                                },
                                totalStationsFound: gasStations.length
                            };
                            console.log(`✅ Tìm thấy ${gasStations.length} trạm xăng. Trạm gần nhất: ${gasStations[0].name} (${gasStations[0].distanceText})`);
                        } else {
                            console.log('⚠️ Không tìm thấy trạm xăng trong bán kính 4km');
                        }
                    } catch (error) {
                        console.error('❌ Lỗi khi tìm trạm xăng:', error.message);
                    }
                }

                // Emit cho FE
                global.io.emit('statusUpdate', { 
                    vehicle, 
                    alerts,
                    fuelAlert // Thêm thông tin cảnh báo xăng và trạm xăng
                });
            }

            // Tự động kiểm tra cảnh báo mực xăng
            await this.autoCheckFuelAlert(parsedData.fuelLevel);

            console.log('═══════════════════════════════════════════════════\n');
        });


        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err.message);
        });

        mqttClient.on('close', () => {
            console.log('MQTT connection closed');
        });

        mqttClient.on('reconnect', () => {
            console.log('Đang reconnect MQTT Broker...');
        });
    }

    static close() {
        mqttClient.end(() => {
            console.log('🔌 Đã đóng kết nối MQTT');
        });
    }

    static async autoCheckFuelAlert(fuelLevel) {
        try {
            // Chỉ kiểm tra nếu mực xăng dưới ngưỡng cảnh báo
            if (fuelLevel >= FUEL_ALERT_THRESHOLD) {
                return;
            }

            console.log(`🔍 [AutoCheck] Mực xăng thấp (${fuelLevel}), đang tìm trạm xăng gần nhất...`);

            // Lấy vị trí hiện tại của xe
            const currentLocation = await TrackingService.getCurrentLocation();
            
            if (!currentLocation) {
                console.log('⚠️ [AutoCheck] Không tìm thấy vị trí hiện tại');
                return;
            }

            // Tìm trạm xăng gần nhất
            const gasStations = await GasStationService.findNearestGasStations(
                currentLocation.latitude,
                currentLocation.longitude,
                4000, // Bán kính 4km
                5     // Tối đa 5 trạm
            );

            if (gasStations.length > 0) {
                const nearestStation = gasStations[0];
                console.log(`✅ [AutoCheck] Tìm thấy ${gasStations.length} trạm xăng`);
                console.log(`   📍 Trạm gần nhất: ${nearestStation.name}`);
                console.log(`   📏 Khoảng cách: ${nearestStation.distanceText}`);
                console.log(`   ⏱️  Thời gian di chuyển: ~${nearestStation.travelTime} phút`);
                
                // Emit cảnh báo qua Socket.io nếu có
                if (global.io) {
                    global.io.emit('fuelAlert', {
                        fuelLevel: fuelLevel,
                        threshold: FUEL_ALERT_THRESHOLD,
                        severity: fuelLevel < 200 ? 'CRITICAL' : 'WARNING',
                        location: {
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude
                        },
                        nearestStation: {
                            name: nearestStation.name,
                            brand: nearestStation.brand,
                            address: nearestStation.address,
                            distance: nearestStation.distanceText,
                            travelTime: nearestStation.travelTime,
                            googleMapsUrl: nearestStation.googleMapsUrl
                        },
                        allStations: gasStations.slice(0, 3), // Top 3 trạm gần nhất
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                console.log('⚠️ [AutoCheck] Không tìm thấy trạm xăng trong bán kính 4km');
            }

        } catch (error) {
            console.error('❌ [AutoCheck] Lỗi khi kiểm tra cảnh báo mực xăng:', error.message);
        }
    }
}

module.exports = MqttService;