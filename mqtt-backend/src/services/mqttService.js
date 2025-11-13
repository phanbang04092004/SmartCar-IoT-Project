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
        mqttClient.on('message', async(receivedTopic, message) => {
            const payload = message.toString();
            console.log('═══════════════════════════════════════════════════');
            console.log(`Nhận dữ liệu từ topic: ${receivedTopic}`);
            console.log(`Payload: ${payload}`);

            const parsedData = TrackingService.parseTrackingData(payload);

            if (parsedData) {
                console.log('Dữ liệu đã parse thành công:');
                console.log(JSON.stringify(parsedData, null, 2));

                const saved = await TrackingService.saveTrackingData(parsedData);

                if (saved) {
                    console.log('Hoàn tất xử lý dữ liệu');
                }
            } else {
                console.log('Bỏ qua dữ liệu không hợp lệ');
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