const mqtt = require('mqtt');

// 1. Cấu hình kết nối
// Thay thế bằng thông tin thực tế của bạn
const brokerUrl = 'mqtts://dbdd316e91e448408b3570eb798874b2.s1.eu.hivemq.cloud:8883';
const topicToSubscribe = 'fuelLevel'; // <=== Thay thế topic của bạn

const options = {
    // BẮT BUỘC: Vì dùng cổng 8883 (TLS), phải dùng mqtts://
    protocol: 'mqtts',

    // TÙY CHỌN: Nếu bạn đã thiết lập bảo mật trong HiveMQ Cloud
    username: 'iotnhom16',
    password: 'Iotnhom16',

    // Cài đặt thêm (nên có)
    clean: true,
    clientId: 'mqtt_backend_' + Math.random().toString(16).substr(2, 8),
};

// 2. Tạo Client và Kết nối
console.log('Đang kết nối tới HiveMQ Cloud...');
const client = mqtt.connect(brokerUrl, options);

// 3. Xử lý sự kiện 'connect' (Kết nối thành công)
client.on('connect', () => {
    console.log('✅ Đã kết nối thành công với Broker!');

    // Đăng ký (Subscribe) vào topic
    client.subscribe(topicToSubscribe, (err) => {
        if (!err) {
            console.log(`Đã đăng ký (subscribe) vào topic: ${topicToSubscribe}`);
        } else {
            console.error('Lỗi khi đăng ký:', err);
        }
    });
});

// 4. Xử lý sự kiện 'message' (Nhận dữ liệu)
client.on('message', (topic, message) => {
    // Dữ liệu được trả về dưới dạng Buffer, cần chuyển thành String
    const payload = message.toString();

    console.log('--------------------------------------------------');
    console.log(`Nhận được dữ liệu từ Topic: ${topic}`);
    console.log(`Dữ liệu (String): ${payload}`);

    // THAO TÁC QUAN TRỌNG: 
    // - Parse dữ liệu (thường là JSON)
    try {
        const data = JSON.parse(payload);
        console.log('Dữ liệu (JSON):', data);

        // ===>>> XỬ LÝ DỮ LIỆU TẠI ĐÂY: Lưu vào Database, gửi qua Socket.IO, v.v.

    } catch (e) {
        console.error('Dữ liệu không phải là JSON hợp lệ.');
    }
});

// 5. Xử lý sự kiện 'error'
client.on('error', (err) => {
    console.error('❌ Lỗi kết nối MQTT:', err);
    client.end();
});

// 6. Xử lý sự kiện 'close'
client.on('close', () => {
    console.log('Đã ngắt kết nối MQTT.');
});