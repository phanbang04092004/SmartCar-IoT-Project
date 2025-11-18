1. Các thành phần:
- 1 vi xử lí ESP8266
- 1 cảm biến thu tín hiệu GPS và 1 anten
- 1 cảm biến đo mực nước/xăng
- 1 cảm biến đóng mở cửa
- Dây dẫn
- Nguồn - 5V từ máy tính
2. Nối dây:
- Cấp nguền cho vi xử lí bằng cổng type-C trên vi xử lí, chân này cũng dùng để truyền chương trình tới vi xử lí.
- Cảm biến GPS bao gồm 5 chân:
  + 1 chân kết nối tới anten.
  + 2 chân GND và VCC kết nối lần lướt tới cổng GND và 3.3V trên vi xử lí để cấp nguồn cho cảm biến
  + Chân TX để truyền dữ liệu đi kết nối tới cổng GPIO14 trên vi xử lí.
  + Chân RX để nhận dữ liệu kết nối tới cổng GPIO04 trên vi xử lí.
- Cảm biến mực nước bao gồm 3 chân:
  + 2 chân GND và VCC kết nối lần lượt tới cổng GND và Vin (5v) trên vi xử lí để cáp nguồn cho mạch.
  + Chân truyền dữ liệu kết nối tới cổng analog A0 trên vi xử lí.
- Cảm biến đóng mở cốp bao gồm 2 chân:
  + 1 chân kết nối tới cổng GND trên vi xử lí.
  + 1 chân kết nối tới cổng GPIO15 trên vi xử lí.

3. Hoạt động:
- Cảm biến GPS:
  + Trả về tín hiệu thu được từ vệ tinh, vi xử lí tính toán các giá trị: latitude, longtitude dựa trên tín hiệu này.
  + Trả về timestamp từ vệ tinh.
- Cảm biến mực nước: 
  + Dựa vào độ cao của mực nước trả về giá trị tương ứng 0 - 1000.
- Cảm biến đóng mở cốp:
  + Khi 2 miếng từ gần nhau thì tín hiệu được truyền - trả về giá trị 1
  + Ngược lại thì trả về 0.

- Vi xử lí đọc dữ liệu từ các cảm biến:
  + Cảm biến GPS lấy về các thông tin: latitude, longtitude, timestamp.
  + Cảm biến đóng mở cốp trả về 1 giá trị: 0/1 (tương ứng với mớ/đóng).
  + Cảm biến mực nước trả về giá trị: 0-1000 (tương ứng với mợc xăng trong bình)
- Vi xử lí tạo định dạng gói tin gửi đi, trường hợp không đọc được dữ liệu từ cảm biến nào thì truyền đi '-1' tại vị trí tương ứng.
  + date, time, latitude, longtitude, mực xăng, trạng thái cốp
