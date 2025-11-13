const mqtt = require('mqtt');
require('dotenv').config();

// Tạo MQTT client 
const options = {
    protocol: 'mqtts',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clean: true,
    clientId: 'mqtt_backend_' + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 5000, // Tự động reconnect sau 5s nếu mất kết nối
};

// Kết nối tới Mosquitto (HiveMQ Cloud) Broker
const client = mqtt.connect(process.env.MQTT_BROKER, options);

// Xử lý sự kiện kết nối thành công
client.on('connect', () => {
    console.log('✅ Đã kết nối MQTT Broker thành công!');
});

// Xử lý lỗi kết nối
client.on('error', (err) => {
    console.error('❌ Lỗi kết nối MQTT:', err.message);
});

// Xử lý ngắt kết nối
client.on('close', () => {
    console.log('⚠️  MQTT connection closed');
});

// Xử lý reconnect
client.on('reconnect', () => {
    console.log('🔄 Đang reconnect MQTT...');
});

module.exports = client;