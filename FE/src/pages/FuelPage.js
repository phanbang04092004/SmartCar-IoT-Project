import React from 'react';
import { useData } from '../context/DataContext';
import FuelChart from '../components/FuelChart';
import FuelGauge from '../components/FuelGauge';

// ==========================================================
// !!! DUNG TÍCH BÌNH XĂNG (ĐÃ SỬA THEO YÊU CẦU) !!!
// ==========================================================
const MAX_FUEL_CAPACITY_ML = 570; // Dung tích 160 ml
// ==========================================================

/**
 * Hàm trợ giúp: Chuyển đổi ml sang %
 * @param {number} current_ml - Mức xăng hiện tại (ml)
 * @returns {number} Mức xăng (%)
 */
const convertMlToPercentage = (current_ml) => {
    if (!current_ml || current_ml < 0) {
        return 0;
    }
    const percentage = (current_ml / MAX_FUEL_CAPACITY_ML) * 100;
    // Làm tròn đến 1 chữ số thập phân, và đảm bảo không vượt quá 100%
    return Math.min(Math.round(percentage * 10) / 10, 100);
};

export default function FuelPage() {
    const { currentStatus, historyData } = useData();

    // 1. Chuyển đổi mức xăng HIỆN TẠI (ml) sang %
    const currentFuelPercentage = convertMlToPercentage(currentStatus.fuel);

    // 2. Chuyển đổi dữ liệu LỊCH SỬ (ml) sang % cho biểu đồ
    const fuelHistoryPercentage = historyData.fuel.map(dataPoint => ({
        ...dataPoint, // Giữ nguyên 'time'
        level: convertMlToPercentage(dataPoint.level) // Chuyển 'level' (ml) sang %
    }));

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1: Đồng hồ 3 mức */}
                <div className="lg:col-span-1">
                    {/* Bây giờ chúng ta truyền % vào đồng hồ.
                      FuelGauge sẽ hiển thị 3 mức (Đỏ/Vàng/Xanh) dựa trên %.
                    */}
                    <FuelGauge level={currentFuelPercentage} />

                    {/* Hiển thị cả số ml gốc cho rõ ràng */}
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center mt-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Dung tích (ml)</h3>
                        <span className="text-4xl font-bold text-gray-800">
                            {/* Dùng currentStatus.fuel (ml) gốc ở đây */}
                            {currentStatus.fuel.toLocaleString('vi-VN')}
                         </span>
                        <span className="text-lg text-gray-500"> / {MAX_FUEL_CAPACITY_ML.toLocaleString('vi-VN')} ml</span>
                    </div>
                </div>

                {/* Cột 2: Biểu đồ lịch sử */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">⛽ Lịch sử nhiên liệu (%)</h2>
                    <div className="chart-widget-content">
                        {/* Bây giờ chúng ta truyền dữ liệu % vào biểu đồ.
                          Biểu đồ (FuelChart) đã có domain [0, 100] nên sẽ hiển thị đúng.
                        */}
                        <FuelChart data={fuelHistoryPercentage} />
                    </div>
                </div>
            </div>
        </div>
    );
}