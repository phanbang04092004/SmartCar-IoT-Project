import React from 'react';
import { useData } from '../context/DataContext';
import FuelChart from '../components/FuelChart';
import FuelGauge from '../components/FuelGauge'; // <-- IMPORT COMPONENT MỚI

export default function FuelPage() {
    const { currentStatus, historyData } = useData();

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1: Đồng hồ 3 mức (MỚI) */}
                <div className="lg:col-span-1">
                    <FuelGauge level={currentStatus.fuel} />
                </div>

                {/* Cột 2: Biểu đồ lịch sử (GIỮ NGUYÊN) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">⛽ Lịch sử nhiên liệu</h2>
                    <div className="chart-widget-content">
                        <FuelChart data={historyData.fuel} />
                    </div>
                </div>
            </div>
        </div>
    );
}