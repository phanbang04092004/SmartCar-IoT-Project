import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import MapComponent from '../components/MapComponent';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import RoutingComponent from '../components/RoutingComponent'; // Import component chỉ đường

// Hàm lấy thời gian mặc định (1 giờ trước)
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

// Icon trạm xăng
const gasStationIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/313/313886.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

export default function MapPage() {
    const { currentStatus, isLoading: isDataLoading } = useData();

    // Các state cho LỊCH SỬ LỘ TRÌNH (Sẽ được dùng ở dưới)
    const [routeData, setRouteData] = useState([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const defaultTimes = getDefaultTimeRange();
    const [startTime, setStartTime] = useState(defaultTimes.start);
    const [endTime, setEndTime] = useState(defaultTimes.end);

    // Các state cho TÌM TRẠM XĂNG
    const [gasStations, setGasStations] = useState([]);
    const [isFindingGas, setIsFindingGas] = useState(false);

    // State cho CHỈ ĐƯỜNG
    const [routingWaypoints, setRoutingWaypoints] = useState({ start: null, end: null });

    // Hàm TẢI LỘ TRÌNH (Sử dụng các state ở trên)
    const handleLoadRoute = async () => {
        setIsLoadingRoute(true);
        setRouteData([]);
        try {
            const formattedStartTime = startTime.replace('T', ' ') + ':00';
            const formattedEndTime = endTime.replace('T', ' ') + ':00';

            const response = await fetch(`http://localhost:3000/api/locations/route?startTime=${formattedStartTime}&endTime=${formattedEndTime}`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                const numericData = data.data.map(point => ({
                    ...point,
                    latitude: parseFloat(point.latitude),
                    longitude: parseFloat(point.longitude)
                }));
                setRouteData(numericData);
            } else {
                alert("Không tìm thấy dữ liệu lộ trình cho khoảng thời gian này.");
            }
        } catch (err) {
            console.error("Lỗi khi tải lộ trình:", err);
            alert("Đã xảy ra lỗi khi tải lộ trình.");
        }
        setIsLoadingRoute(false);
    };

    // Hàm TÌM TRẠM XĂNG
    const handleFindGasStations = async () => {
        setIsFindingGas(true);
        setGasStations([]);
        const { lat, lng } = currentStatus.location;
        try {
            const API_ENDPOINT = `/api/locations/gas-stations?lat=${lat}&lng=${lng}`;
            const response = await fetch(`http://localhost:3000${API_ENDPOINT}`);
            const data = await response.json();
            if (data.success && data.stations) {
                setGasStations(data.stations);
            } else {
                alert("Không tìm thấy trạm xăng nào gần đây.");
            }
        } catch (err) {
            console.error("Lỗi khi tìm trạm xăng:", err);
            alert("Lỗi kết nối đến server tìm trạm xăng.");
        }
        setIsFindingGas(false);
    };

    // Hàm BẮT ĐẦU CHỈ ĐƯỜNG
    const handleStartRouting = (stationLat, stationLng) => {
        setRoutingWaypoints({
            start: currentStatus.location, // Điểm A: Vị trí xe
            end: { lat: stationLat, lng: stationLng } // Điểm B: Trạm xăng
        });
    };

    // Hàm XÓA CHỈ ĐƯỜNG
    const handleClearRouting = () => {
        setRoutingWaypoints({ start: null, end: null });
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

    // Biến an toàn (chống lỗi .toFixed)
    const safeLocation = currentStatus.location;
    const latText = (safeLocation && typeof safeLocation.lat === 'number')
        ? safeLocation.lat.toFixed(6)
        : 'Đang tải...';
    const lngText = (safeLocation && typeof safeLocation.lng === 'number')
        ? safeLocation.lng.toFixed(6)
        : 'Đang tải...';


    return (
        <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-lg p-6">

                {/* ========================================================== */}
                {/* PHẦN BỊ MẤT CỦA BẠN (TẢI LỘ TRÌNH) */}
                {/* ========================================================== */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">🗺️ Lịch sử lộ trình</h2>
                <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    {/* Ô chọn thời gian bắt đầu */}
                    <div className="flex-1">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Từ lúc</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)} // <-- SỬ DỤNG setStartTime
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    {/* Ô chọn thời gian kết thúc */}
                    <div className="flex-1">
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Đến lúc</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)} // <-- SỬ DỤNG setEndTime
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    {/* Nút Tải */}
                    <button
                        onClick={handleLoadRoute} // <-- SỬ DỤNG handleLoadRoute
                        disabled={isLoadingRoute} // <-- SỬ DỤNG isLoadingRoute
                        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {isLoadingRoute ? ( // <-- SỬ DỤNG isLoadingRoute
                            <i className="fas fa-spinner animate-spin mr-2"></i>
                        ) : (
                            <i className="fas fa-search-location mr-2"></i>
                        )}
                        Tải lộ trình
                    </button>
                </div>

                {/* Phần 2: Bản đồ */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">📍 Vị trí hiện tại</h2>

                    <div>
                        {routingWaypoints.start && (
                            <button
                                onClick={handleClearRouting}
                                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow hover:bg-gray-600 transition mr-4"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Xóa chỉ đường
                            </button>
                        )}
                        <button
                            onClick={handleFindGasStations}
                            disabled={isFindingGas}
                            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition disabled:bg-gray-400"
                        >
                            {isFindingGas ? (
                                <i className="fas fa-spinner animate-spin mr-2"></i>
                            ) : (
                                <i className="fas fa-charging-station mr-2"></i>
                            )}
                            Tìm trạm xăng
                        </button>
                    </div>
                </div>

                {safeLocation ? (
                    <>
                        <div className="text-sm text-gray-600 mb-4 font-mono">
                            <span className="mr-4">Vĩ độ (Lat): <strong className="text-gray-900">{latText}</strong></span>
                            <span>Kinh độ (Lng): <strong className="text-gray-900">{lngText}</strong></span>
                        </div>

                        <div className="full-page-map rounded-lg overflow-hidden border">
                            <MapComponent
                                location={safeLocation}
                                pathHistory={routeData.map(p => [p.latitude, p.longitude])}
                            >
                                {routingWaypoints.start && (
                                    <RoutingComponent
                                        start={routingWaypoints.start}
                                        end={routingWaypoints.end}
                                    />
                                )}
                                {gasStations.map((station, index) => (
                                    <Marker
                                        key={index}
                                        position={[station.latitude, station.longitude]}
                                        icon={gasStationIcon}
                                    >
                                        <Popup>
                                            <strong>{station.name}</strong>
                                            <br/>
                                            {station.address && <span>{station.address}<br/></span>}
                                            Cách đây: {station.distanceText}
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapComponent>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-red-500">
                        <i className="fas fa-exclamation-triangle text-3xl mb-4"></i>
                        <p className="font-semibold">Không thể tải dữ liệu vị trí...</p>
                    </div>
                )}

                {/* Bảng Lịch sử Lộ trình */}
                {routeData.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Bảng dữ liệu chi tiết lộ trình ({routeData.length} điểm)
                        </h3>
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
                                {routeData.map((point, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
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

                {/* Bảng Trạm xăng */}
                {gasStations.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            ⛽ Danh sách trạm xăng gần đây ({gasStations.length} trạm)
                        </h3>
                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên trạm xăng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoảng cách</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {gasStations.map((station, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {station.name}
                                            {station.brand && <span className="ml-2 text-xs text-gray-500">({station.brand})</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {station.address || 'Không có thông tin'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                            {station.distanceText}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleStartRouting(station.latitude, station.longitude)}
                                                className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md shadow hover:bg-green-700 transition"
                                            >
                                                <i className="fas fa-directions mr-1"></i>
                                                Chỉ đường
                                            </button>
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