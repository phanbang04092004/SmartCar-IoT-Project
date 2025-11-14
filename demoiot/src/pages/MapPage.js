import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import MapComponent from '../components/MapComponent';

// (Hàm getDefaultTimeRange giữ nguyên)
const getDefaultTimeRange = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const formatForInput = (date) => {
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
    };
    return {
        start: formatForInput(oneHourAgo),
        end: formatForInput(now)
    };
};

export default function MapPage() {
    const { currentStatus, isLoading: isDataLoading } = useData();

    // 1. ĐỔI TÊN STATE ĐỂ LƯU DỮ LIỆU THÔ
    const [routeData, setRouteData] = useState([]); // <-- Sẽ lưu mảng [{timestamp, latitude, longitude}, ...]
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    const defaultTimes = getDefaultTimeRange();
    const [startTime, setStartTime] = useState(defaultTimes.start);
    const [endTime, setEndTime] = useState(defaultTimes.end);

    const handleLoadRoute = async () => {
        setIsLoadingRoute(true);
        setRouteData([]); // 2. XÓA DỮ LIỆU THÔ CŨ

        try {
            const formattedStartTime = startTime.replace('T', ' ') + ':00';
            const formattedEndTime = endTime.replace('T', ' ') + ':00';

            const response = await fetch(`http://localhost:3000/api/vehicle/route?startTime=${formattedStartTime}&endTime=${formattedEndTime}`);
            const data = await response.json();

            if (data.success && data.route.length > 0) {
                // 3. LƯU TOÀN BỘ DỮ LIỆU THÔ VÀO STATE
                setRouteData(data.route);
            } else {
                alert("Không tìm thấy dữ liệu lộ trình cho khoảng thời gian này.");
            }
        } catch (err) {
            console.error("Lỗi khi tải lộ trình:", err);
            alert("Đã xảy ra lỗi khi tải lộ trình.");
        }
        setIsLoadingRoute(false);
    };

    // (Kiểm tra isDataLoading giữ nguyên)
    if (isDataLoading) {
        return (
            <div className="container mx-auto px-4 py-6 text-center">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <i className="fas fa-spinner animate-spin text-4xl text-blue-600"></i>
                    <h2 className="text-xl font-semibold mt-4">Đang tải dữ liệu ban đầu...</h2>
                </div>
            </div>
        );
    }

    // Nếu không loading, hiển thị nội dung
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-lg p-6">

                {/* Phần 1: Tải lộ trình (Giữ nguyên) */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">🗺️ Lịch sử lộ trình</h2>
                <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    {/* ... (Input Thời gian bắt đầu) ... */}
                    <div className="flex-1">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Từ lúc</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    {/* ... (Input Thời gian kết thúc) ... */}
                    <div className="flex-1">
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Đến lúc</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <button
                        onClick={handleLoadRoute}
                        disabled={isLoadingRoute}
                        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {isLoadingRoute ? (
                            <i className="fas fa-spinner animate-spin mr-2"></i>
                        ) : (
                            <i className="fas fa-search-location mr-2"></i>
                        )}
                        Tải lộ trình
                    </button>
                </div>

                {/* Phần 2: Bản đồ (Giữ nguyên) */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">📍 Vị trí hiện tại</h2>
                    <button
                        onClick={() => alert('Đang tìm trạm xăng...')}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition"
                    >
                        <i className="fas fa-charging-station mr-2"></i>
                        Tìm trạm xăng gần nhất
                    </button>
                </div>

                <div className="text-sm text-gray-600 mb-4 font-mono">
                    <span className="mr-4">Vĩ độ (Lat): <strong className="text-gray-900">{currentStatus.location.lat.toFixed(6)}</strong></span>
                    <span>Kinh độ (Lng): <strong className="text-gray-900">{currentStatus.location.lng.toFixed(6)}</strong></span>
                </div>

                <div className="full-page-map rounded-lg overflow-hidden border">
                    <MapComponent
                        location={currentStatus.location}
                        // 4. TRUYỀN DỮ LIỆU ĐÃ BIẾN ĐỔI CHO BẢN ĐỒ
                        pathHistory={routeData.map(p => [p.latitude, p.longitude])}
                    />
                </div>

                {/* ========================================================== */}
                {/* 5. PHẦN BẢNG MỚI (THEO YÊU CẦU CỦA BẠN) */}
                {/* ========================================================== */}
                {routeData.length > 0 && ( // Chỉ hiển thị bảng nếu có dữ liệu
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Bảng dữ liệu chi tiết lộ trình ({routeData.length} điểm)
                        </h3>
                        {/* Giới hạn chiều cao và thêm thanh cuộn */}
                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian (Timestamp)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vĩ độ (Latitude)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kinh độ (Longitude)</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {/* Dùng routeData (dữ liệu thô) để vẽ bảng */}
                                {routeData.map((point, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                            {/* Format lại timestamp cho dễ đọc */}
                                            {new Date(point.timestamp).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                            {point.latitude.toFixed(6)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                                            {point.longitude.toFixed(6)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}