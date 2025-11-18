import React from 'react';

// === CÁC ẢNH MINH HỌA ===
import featureMapImage from '../images/feature_map.png'; // Ảnh bạn đã có
import fuelImage from '../images/fuel_monitoring.jpg';  // <-- Ảnh mới
import trunkImage from '../images/trunk_status.jpg';     // <-- Ảnh mới
import historyImage from '../images/history_tracking.jpg'; // <-- Ảnh mới
import warningImage from '../images/warning_alert.jpg';    // <-- Ảnh mới
import gasStationImage from '../images/gas_station.jpg';   // <-- Ảnh mới
// ==========================


export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-10">
            {/* Tiêu đề chính */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    CHỨC NĂNG NỔI BẬT CỦA V-TRACKING
                </h1>
                <p className="text-lg text-gray-600">
                    Hệ thống giám sát xe vận tải IoT - Giúp bạn quản lý hiệu quả và an toàn.
                </p>
            </div>

            {/* Các icon chức năng nổi bật (Giữ nguyên) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 mb-16 text-center">
                {/* 1. Giám sát vị trí */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Giám sát vị trí</p>
                </div>
                {/* 2. Giám sát Nhiên liệu */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-gas-pump"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Giám sát Nhiên liệu</p>
                </div>
                {/* 3. Kiểm tra cốp */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-truck-loading"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Kiểm tra cốp</p>
                </div>
                {/* 4. Xem lại hành trình */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-route"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Xem lại hành trình</p>
                </div>
                {/* 5. Cảnh báo tức thời */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gray-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-bell"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Cảnh báo tức thời</p>
                </div>
                {/* 6. Tìm trạm xăng */}
                <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl mb-3">
                        <i className="fas fa-charging-station"></i>
                    </div>
                    <p className="font-semibold text-gray-700">Tìm trạm xăng</p>
                </div>
            </div>

            {/* Phần giới thiệu chi tiết từng chức năng */}
            <div className="space-y-16">

                {/* 1. Giám sát vị trí (Dùng ảnh của bạn) */}
                <section className="flex flex-col lg:flex-row items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Giám sát vị trí</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Vị trí hiện trên bản đồ số và trạng thái hoạt động tạm thời</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Vận tốc, số km đi được, trạng thái đóng mở cửa, tắt mở máy, trạng thái điều hòa, thông tin đặt xe, ...</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Hiển thị các cảnh cáo nóng như SOS, quá tốc độ, vi phạm thời gian lái xe liên tục, vi phạm thời gian lái xe trong ngày</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Hình ảnh theo một khoảng thời gian</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={featureMapImage}
                            alt="Giám sát vị trí"
                            className="rounded-lg shadow-xl max-w-full h-auto"
                        />
                    </div>
                </section>

                {/* 2. Theo dõi mực nhiên liệu (Ảnh mới) */}
                <section className="flex flex-col lg:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pl-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Theo dõi mực nhiên liệu</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Giám sát mức nhiên liệu theo thời gian thực (ml và %)</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Biểu đồ lịch sử tiêu thụ nhiên liệu</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Cảnh báo khi mức nhiên liệu xuống thấp (3 mức Đỏ-Vàng-Xanh)</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Thống kê nhiên liệu tiêu thụ trong mỗi hành trình</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={fuelImage} // <-- ĐÃ SỬA
                            alt="Theo dõi nhiên liệu"
                            className="rounded-lg shadow-xl max-w-full h-auto object-cover"
                        />
                    </div>
                </section>

                {/* 3. Theo dõi trạng thái cốp (Ảnh mới) */}
                <section className="flex flex-col lg:flex-row items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Theo dõi trạng thái đóng/mở thùng xe</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Giám sát trạng thái cốp xe (mở/đóng) theo thời gian thực</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Ghi lại lịch sử các sự kiện mở/đóng cốp</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Cảnh báo khi cốp mở ngoài ý muốn</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Thống kê số lần mở cốp trong một hành trình</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={trunkImage} // <-- ĐÃ SỬA
                            alt="Theo dõi cốp xe"
                            className="rounded-lg shadow-xl max-w-full h-auto object-cover"
                        />
                    </div>
                </section>

                {/* 4. Lịch sử hành trình (Ảnh mới) */}
                <section className="flex flex-col lg:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pl-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Lịch sử hành trình (Thống kê)</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Lưu trữ và xem lại các phiên theo dõi trước đó</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Xem tổng thời gian di chuyển của mỗi phiên</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Thống kê số lần cốp được mở trong từng hành trình</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Thống kê tổng quãng đường (km) và nhiên liệu tiêu thụ (ml)</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={historyImage} // <-- ĐÃ SỬA
                            alt="Lịch sử hành trình"
                            className="rounded-lg shadow-xl max-w-full h-auto object-cover"
                        />
                    </div>
                </section>

                {/* 5. PHẦN MỚI: Cảnh báo tức thời (Ảnh mới) */}
                <section className="flex flex-col lg:flex-row items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Cảnh báo tức thời</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Cảnh báo SOS khẩn cấp khi tài xế gặp sự cố</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Phát hiện và cảnh báo khi xe vượt quá tốc độ cho phép</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Cảnh báo khi mực nhiên liệu xuống mức thấp (đã cấu hình)</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Thông báo ngay lập tức khi thùng xe bị mở</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Giám sát thời gian lái xe liên tục (chống mệt mỏi)</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={warningImage} // <-- ĐÃ SỬA
                            alt="Cảnh báo tức thời"
                            className="rounded-lg shadow-xl max-w-full h-auto object-cover"
                        />
                    </div>
                </section>

                {/* 6. Tìm trạm xăng (Ảnh mới) */}
                <section className="flex flex-col lg:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8 overflow-hidden">
                    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pl-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tìm trạm xăng gần nhất</h2>
                        <ul className="list-none space-y-3 text-lg text-gray-700">
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Tích hợp trực tiếp vào trang Bản đồ</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Hiển thị các trạm xăng xung quanh vị trí xe hiện tại</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Hiển thị thông tin tên, địa chỉ, khoảng cách</li>
                            <li><i className="fas fa-check-circle text-green-500 mr-3"></i>Hỗ trợ chỉ đường ngay trên bản đồ (dùng OSRM)</li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 flex justify-center">
                        <img
                            src={gasStationImage} // <-- ĐÃ SỬA
                            alt="Tìm trạm xăng"
                            className="rounded-lg shadow-xl max-w-full h-auto object-cover"
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}