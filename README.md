<div align="center">

# SmartCar IoT Project

_Giám sát đội xe vận tải thời gian thực bằng IoT, MQTT và dashboard web._

</div>

---

## 📚 Mục lục

1. [Giới thiệu](#-giới-thiệu)
2. [Điểm nổi bật](#-điểm-nổi-bật)
3. [Kiến trúc tổng thể](#-kiến-trúc-tổng-thể)
4. [Công nghệ & cấu trúc thư mục](#-công-nghệ--cấu-trúc-thư-mục)
5. [Yêu cầu môi trường](#-yêu-cầu-môi-trường)
6. [Thiết lập Backend](#-thiết-lập-backend)
7. [Thiết lập Frontend](#-thiết-lập-frontend)
8. [Firmware ESP8266](#-firmware-esp8266)
9. [Luồng dữ liệu & payload](#-luồng-dữ-liệu--payload)
10. [API Reference](#-api-reference)
11. [Socket.IO Events](#-socketio-events)
12. [Kiểm tra & gỡ lỗi](#-kiểm-tra--gỡ-lỗi)
13. [Lộ trình phát triển](#-lộ-trình-phát-triển)

---

## 🚀 Giới thiệu

- **SmartCar IoT** là hệ thống giám sát xe vận tải gồm thiết bị ESP8266 thu thập dữ liệu, backend Node.js xử lý & lưu trữ và dashboard React hiển thị trực quan.
- **Bài toán**: Theo dõi vị trí, mức nhiên liệu, trạng thái thùng xe và cảnh báo trạm xăng gần nhất khi nhiên liệu xuống thấp.
- **Đối tượng**: Đội xe logistics, doanh nghiệp vận tải, dự án học thuật liên quan tới IoT và giao thông.

---

## ✨ Điểm nổi bật

- Giám sát vị trí thời gian thực kèm lịch sử hành trình.
- Theo dõi nhiên liệu (ml/%), biểu đồ tiêu thụ, cảnh báo đa cấp.
- Ghi nhận trạng thái thùng xe, đếm số lần mở trong mỗi hành trình.
- Tự động gợi ý trạm xăng gần nhất (Overpass API) khi nhiên liệu thấp.
- Quản lý phiên hành trình (start/stop) để thống kê quãng đường và nhiên liệu tiêu thụ.
- Socket.IO đẩy dữ liệu tức thời, giảm độ trễ cập nhật UI.

---

## 🏗 Kiến trúc tổng thể

```
[ESP8266 + GPS + cảm biến]
        │  MQTT (TLS)
        ▼
[Node.js Backend]
    ├─ REST API (Express)
    ├─ MQTT Service + MySQL
    └─ Socket.IO realtime
        │
        ▼
[React Dashboard]
```

- **Thiết bị IoT**: ESP8266 + GPS NEO-6M + cảm biến nhiên liệu + công tắc thùng xe.
- **Backend**: Express 5, MySQL2, MQTT client, Socket.IO, Overpass API.
- **Frontend**: React 19, React Router 7, TailwindCSS, Leaflet, Recharts.

---

## 🗂 Công nghệ & cấu trúc thư mục

| Thành phần | Công nghệ chính | Thư mục |
|------------|-----------------|---------|
| Backend    | Node.js, Express, MQTT, Socket.IO, MySQL, Axios | `backend3/` |
| Frontend   | React, CRA, TailwindCSS, Leaflet, Recharts, Socket.IO Client | `FE/` |
| Firmware   | Arduino core for ESP8266, TinyGPS++, PubSubClient, BearSSL | `code mạch - esp8266/` |

```
.
├── backend3/                # REST API + MQTT service
├── FE/                      # React dashboard
├── code mạch - esp8266/     # Firmware nguồn
└── README.md
```

---

## ⚙️ Yêu cầu môi trường

- Node.js ≥ 18 và npm ≥ 10.
- MySQL 8 (hỗ trợ SSL nếu kết nối cloud).
- MQTT broker hỗ trợ TLS (ví dụ HiveMQ Cloud).
- Arduino IDE ≥ 2.x + board ESP8266 được cài đặt.
- Công cụ hỗ trợ: MQTT Explorer (debug), Postman (test API).

---

## 🛠 Thiết lập Backend

### 1. Tạo file `.env`

```bash
cd backend3
cp .env.example .env   # nếu chưa có, tự tạo theo mẫu dưới
```

```
PORT=3000

# MQTT
MQTT_BROKER=mqtts://<host>:8883
MQTT_TOPIC=Tracking data
MQTT_USERNAME=<username>
MQTT_PASSWORD=<password>

# MySQL
DB_HOST=<host>
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=smartcar
DB_SSL_CA=./certs/ca.pem   # đường dẫn chứng chỉ CA (bắt buộc khi dùng SSL)
```

> Nếu không dùng SSL, chỉnh `src/config/database.js` để bỏ trường `ssl`.

### 2. Cài đặt & chạy

```bash
cd backend3
npm install
npm run dev          # khởi động với nodemon, mặc định http://localhost:3000
```

### 3. Thành phần chính

- `app.js`: khởi tạo Express, Socket.IO, đăng ký routes, MQTT service.
- `src/api`: controllers + routes (`locations`, `vehicle`, `fuel-alert`, `health`).
- `src/services/mqttService.js`: subscribe MQTT, parse payload, lưu DB, emit Socket.IO, gọi Overpass API.
- `src/services/trackingService.js`: thao tác MySQL (locations / fuel / trunk).
- `src/services/gasStationService.js`: gọi Overpass API và dữ liệu dự phòng khi quá tải.

---

## 💻 Thiết lập Frontend

### 1. Cấu hình endpoint

`BACKEND_URL` hiện được cố định trong `src/context/DataContext.js`. Khi triển khai, hãy chuyển sang biến môi trường CRA (`REACT_APP_BACKEND_URL`) để dễ cấu hình.

### 2. Cài đặt & chạy

```bash
cd FE
npm install
npm start          # CRA dev server (mặc định http://localhost:3000)
```

> Nếu backend cũng dùng port 3000, hãy đổi một trong hai (ví dụ backend `PORT=4000`) hoặc thêm proxy trong `package.json`.

### 3. Các trang chính

- `HomePage`: giới thiệu tính năng, hình minh hoạ.
- `MapPage`: bản đồ Leaflet, vẽ lộ trình và định tuyến.
- `FuelPage`: gauge nhiên liệu + biểu đồ Recharts.
- `TrunkPage`: trạng thái thùng xe và lịch sử mở/đóng.
- `HistoryPage`: quản lý phiên hành trình, thống kê quãng đường / nhiên liệu.

---

## 📡 Firmware ESP8266

- File: `code mạch - esp8266/Main.ino`.
- Phần cứng:
  - ESP8266 (NodeMCU).
  - GPS NEO-6M (RX/TX được định nghĩa trong mã).
  - Cảm biến mực nhiên liệu analog (A0).
  - Công tắc hành trình thùng xe (GPIO15).
- Thư viện cần cài: `TinyGPSPlus`, `PubSubClient`, `BearSSL`, `CertStoreBearSSL`, `LittleFS`.
- Payload MQTT gồm **6 trường**: `DD/MM/YYYY,HH:MM:SS,latitude,longitude,fuelLevel,trunkStatus`.

### Nạp chương trình

1. Cập nhật SSID, password WiFi và thông số MQTT trong file `.ino`.
2. Cài đặt thư viện cần thiết bằng Library Manager.
3. Build & Upload từ Arduino IDE.
4. Mở Serial Monitor (9600 baud) để kiểm tra log WiFi, MQTT và dữ liệu gửi.

---

## 🔁 Luồng dữ liệu & payload

1. ESP8266 đọc GPS + cảm biến, dựng chuỗi CSV.
2. Publish lên topic MQTT (`Tracking data`) dưới dạng:

```
DATE,TIME,LAT,LNG,FUEL,TRUNK
25/11/2025,08:15:30,21.0285,105.8342,820,0
```

3. Backend parse & validate thông tin: thời gian, toạ độ, nhiên liệu, trạng thái thùng.
4. Lưu vào MySQL: `locations`, `fuel_levels`, `trunk_status`.
5. Phát Socket.IO `statusUpdate` (kèm cảnh báo). Nếu nhiên liệu < 500, tự động tìm trạm xăng và có thể phát thêm `fuelAlert`.
6. Frontend nhận sự kiện, cập nhật context và UI theo thời gian thực.

---

## 📘 API Reference

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Kiểm tra trạng thái backend. |
| GET | `/api/locations?startTime&endTime&limit` | Lấy lịch sử vị trí (limit tối đa 1000). |
| GET | `/api/locations/current` | Lấy vị trí gần nhất. |
| GET | `/api/locations/route?startTime&endTime` | Lấy route trong khoảng thời gian. |
| GET | `/api/vehicle/status` | Trạng thái hiện tại (location, fuel, trunk, alerts). |
| GET | `/api/vehicle/fuel-history?limit` | Lịch sử nhiên liệu. |
| GET | `/api/vehicle/trunk-history?limit` | Lịch sử trạng thái thùng xe. |
| GET | `/api/vehicle/route?startTime&endTime` | Route phục vụ trang history. |
| GET | `/api/fuel-alert` | Kiểm tra nhiên liệu + đề xuất trạm xăng gần nhất. |

### Ví dụ: `/api/fuel-alert`

```json
{
  "success": true,
  "alert": true,
  "data": {
    "warning": {
      "message": "🚨 CẢNH BÁO: Mực xăng chỉ còn 180!",
      "fuelLevel": 180,
      "threshold": 500,
      "severity": "CRITICAL"
    },
    "currentLocation": {
      "latitude": 21.0285,
      "longitude": 105.8342,
      "timestamp": "2025-11-25 01:15:30"
    },
    "gasStations": [
      {
        "name": "Petrolimex Láng Hạ",
        "distanceText": "950m",
        "travelTime": 3,
        "googleMapsUrl": "https://www.google.com/maps/dir/?api=1&destination=..."
      }
    ],
    "recommendation": "🚨 KHẨN CẤP: Đi ngay đến \"Petrolimex Láng Hạ\" (950m, ~3 phút).",
    "searchRadius": 4000,
    "totalStationsFound": 3
  }
}
```

---

## 🔔 Socket.IO Events

| Event | Payload | Ghi chú |
|-------|---------|---------|
| `statusUpdate` | `{ vehicle, alerts, fuelAlert }` | Phát mỗi khi có dữ liệu MQTT hợp lệ. |
| `fuelAlert` | `{ fuelLevel, threshold, severity, nearestStation, ... }` | Phát khi auto-check tìm thấy trạm xăng. |

Frontend lắng nghe trong `DataContext`, cập nhật `currentStatus`, lịch sử và session tracking.

---

## 🧪 Kiểm tra & gỡ lỗi

- **Backend**: theo dõi console. Cần thấy log `✅ Kết nối MySQL thành công!` và `Đã subscribe topic`.
- **MQTT**: dùng MQTT Explorer publish payload mẫu (6 trường) để kiểm tra pipeline.
- **Frontend**: mở tab Network đảm bảo API trả JSON hợp lệ; kiểm tra sự kiện Socket.IO trong console.
- **Overpass API**: nếu gặp `429 / timeout`, backend tự dùng dữ liệu fallback; có thể đổi endpoint sang `https://z.overpass-api.de/api/interpreter`.
- **CORS**: hiện mở cho mọi origin (dev). Khi triển khai production, cấu hình whitelist trong `cors()`.

---

## 🛣 Lộ trình phát triển

- Thêm xác thực JWT và phân quyền theo vai trò.
- Lưu session hành trình xuống backend thay vì state frontend.
- Tích hợp thông báo đẩy (Firebase Cloud Messaging) hoặc SMS Gateway.
- Viết tests (Jest cho services, Cypress/Vitest cho frontend).
- Chuẩn hoá schema DB, thêm migration, seed & backup script.

---


