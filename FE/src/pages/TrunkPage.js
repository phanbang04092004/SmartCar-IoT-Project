import React from 'react';
import { useData } from '../context/DataContext';

export default function TrunkPage() {
    const { currentStatus, historyData } = useData();
    const isTrunkOpen = currentStatus.trunk.toLowerCase() === 'opened';

    // Xác định màu sắc và icon dựa trên trạng thái
    const statusConfig = {
        open: {
            color: 'red',
            icon: 'fa-lock-open',
            text: 'ĐANG MỞ',
            bg: 'bg-red-50',
            border: 'border-red-500',
            textC: 'text-red-700'
        },
        closed: {
            color: 'green',
            icon: 'fa-lock',
            text: 'Đã đóng',
            bg: 'bg-green-50',
            border: 'border-green-500',
            textC: 'text-green-700'
        }
    };

    const currentConfig = isTrunkOpen ? statusConfig.open : statusConfig.closed;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Cột 1: Trạng thái hiện tại (Đẹp) */}
                <div className={`rounded-xl shadow-lg p-6 border-2 ${currentConfig.border} ${currentConfig.bg}`}>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Trạng thái cốp hiện tại</h2>

                    <div className="flex flex-col items-center">
                        <i className={`fas ${currentConfig.icon} ${currentConfig.textC} text-9xl mb-6`}></i>
                        <span className={`text-4xl font-bold ${currentConfig.textC}`}>
                            {currentConfig.text}
                        </span>
                        <p className="text-gray-500 mt-2">
                            Cập nhật lúc: {new Date(currentStatus.lastUpdate).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                {/* Cột 2: Lịch sử sự kiện (Đủ) */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lịch sử sự kiện</h2>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {/* Đảo ngược mảng để xem cái mới nhất trước */}
                            {[...historyData.trunkEvents].reverse().map((event, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {event.time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {event.status === 'opened' ? (
                                            <span className="text-red-600">
                                                    <i className="fas fa-lock-open mr-2"></i>Mở cốp
                                                </span>
                                        ) : (
                                            <span className="text-green-600">
                                                    <i className="fas fa-lock mr-2"></i>Đóng cốp
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}