import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';

// Component con để hiển thị đồng hồ bấm giờ (Giữ nguyên)
function LiveTimer({ startTime }) {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDuration(new Date() - startTime);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    return <span className="font-mono">{formatTime(duration)}</span>;
}


export default function HistoryPage() {
    // Lấy các chức năng phiên từ Context
    const {
        sessionHistory,
        isSessionActive,
        currentSession,
        startSession,
        stopSession
    } = useData();

    return (
        <div className="container mx-auto px-4 py-6">
            {/* PHẦN ĐIỀU KHIỂN PHIÊN (Giữ nguyên) */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    {isSessionActive ? (
                        <div className="flex items-center space-x-4 p-3 bg-green-100 text-green-800 rounded-lg mb-4 md:mb-0">
                            <i className="fas fa-satellite-dish text-3xl animate-pulse"></i>
                            <div>
                                <div className="font-semibold text-lg">Phiên đang chạy...</div>
                                <div className="flex space-x-4 text-sm">
                                    <span title="Thời gian">
                                        <i className="fas fa-clock mr-1"></i>
                                        <LiveTimer startTime={currentSession.startTime} />
                                    </span>
                                    <span title="Số lần mở cốp">
                                        <i className="fas fa-truck-loading mr-1"></i>
                                        {currentSession.trunkOpenCount} lần
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <h2 className="text-2xl font-bold text-gray-800">Quản lý phiên</h2>
                            <p className="text-gray-500">Bắt đầu một phiên theo dõi mới để ghi lại hành trình.</p>
                        </div>
                    )}

                    <div>
                        {!isSessionActive ? (
                            <button
                                onClick={startSession}
                                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition text-lg"
                            >
                                <i className="fas fa-play mr-2"></i>BẮT ĐẦU PHIÊN MỚI
                            </button>
                        ) : (
                            <button
                                onClick={stopSession}
                                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition text-lg"
                            >
                                <i className="fas fa-stop mr-2"></i>KẾT THÚC PHIÊN
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PHẦN LỊCH SỬ (Cập nhật bảng) */}
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-7xl mx-auto"> {/* Mở rộng max-w-7xl */}
                <h2 className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                    <i className="fas fa-history mr-3 text-blue-600"></i>
                    Lịch sử các phiên
                </h2>
                {sessionHistory.length === 0 ? (
                    <div className="text-center py-10">
                        <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                        <p className="text-xl text-gray-500">Chưa có bản ghi nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* =============================================== */}
                            {/* NÂNG CẤP BẢNG (thêm 2 cột) */}
                            {/* =============================================== */}
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phiên số</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quãng đường (km)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhiên liệu (ml)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lần mở cốp</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {sessionHistory.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        Phiên #{session.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {session.startTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {session.endTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                                        <i className="fas fa-clock mr-2"></i>
                                        {session.totalTime}
                                    </td>
                                    {/* THÊM DỮ LIỆU MỚI */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">
                                        <i className="fas fa-route mr-2"></i>
                                        {session.totalDistanceKm.toFixed(2)} km
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700">
                                        <i className="fas fa-gas-pump mr-2"></i>
                                        {session.totalFuelConsumed.toLocaleString('vi-VN')} ml
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-700">
                                        <i className="fas fa-truck-loading mr-2"></i>
                                        {session.trunkOpenCount} lần
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}