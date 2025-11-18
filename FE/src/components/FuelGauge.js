import React from 'react';

export default function FuelGauge({ level }) {
    let bgColor = 'bg-green-500'; // Mức 3: Xanh (Mặc định)
    let statusText = 'Đầy đủ';

    if (level < 20) {
        bgColor = 'bg-red-500'; // Mức 1: Đỏ
        statusText = 'Cần đổ xăng';
    } else if (level < 60) {
        bgColor = 'bg-yellow-500'; // Mức 2: Vàng
        statusText = 'Trung bình';
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Mức nhiên liệu hiện tại</h3>

            {/* Đồng hồ (Gauge) */}
            <div className="w-full bg-gray-200 rounded-full h-8 border border-gray-300 overflow-hidden">
                <div
                    className={`h-full ${bgColor} transition-all duration-500 ease-out`}
                    style={{ width: `${level}%` }}
                >
                </div>
            </div>

            {/* Text hiển thị */}
            <div className="mt-4">
                <span className="text-4xl font-bold text-gray-800">{level}%</span>
                <p className={`text-lg font-semibold ${bgColor.replace('bg-', 'text-')}`}>
                    {statusText}
                </p>
            </div>
        </div>
    );
}