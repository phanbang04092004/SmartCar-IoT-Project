const mqttClient = require('../config/mqtt');
const TrackingService = require('./trackingService');
require('dotenv').config();

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

                // Emit cho FE
                global.io.emit('statusUpdate', { vehicle, alerts });
            }

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
}

module.exports = MqttService;