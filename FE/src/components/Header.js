import React from 'react';
import { NavLink } from 'react-router-dom';
import { useData } from '../context/DataContext';
import logo from '../images/logo.png';

export default function Header() {
    const { currentStatus } = useData();
    const lastUpdate = new Date(currentStatus.lastUpdate).toLocaleTimeString();

    const navLinkClass = ({ isActive }) =>
        `py-4 px-3 font-semibold text-sm ${isActive
            ? 'text-yellow-300 border-b-4 border-yellow-300'
            : 'text-white hover:text-yellow-200'
        }`;

    return (
        <nav className="fixed top-0 left-0 right-0 z-[1100] shadow-md">

            {/* TẦNG TRÊN (Màu trắng) */}
            <div className="bg-white">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="Transport Monitoring Logo"
                            className="h-14 w-14 mr-4"
                        />
                        <span className="text-blue-900 text-3xl font-bold tracking-wider">
                            TRANSPORT MONITORING
                        </span>
                    </div>
                    {/* Cập nhật cuối */}
                    <div className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-sync text-gray-500 mr-2"></i>
                        Cập nhật cuối:
                        <strong className="font-semibold text-gray-900 ml-1">{lastUpdate}</strong>
                    </div>
                </div>
            </div>

            {/* TẦNG DƯỚI (Màu đỏ) */}
            <div className="bg-red-600">
                <div className="container mx-auto px-4 flex justify-center items-center">
                    {/* Links điều hướng (Thêm lại History) */}
                    <div className="flex items-center space-x-6">
                        <NavLink to="/" className={navLinkClass} end>
                            <i className="fas fa-home mr-2"></i>Trang chủ
                        </NavLink>
                        <NavLink to="/map" className={navLinkClass}>
                            <i className="fas fa-map-location-dot mr-2"></i>Bản đồ
                        </NavLink>
                        <NavLink to="/fuel" className={navLinkClass}>
                            <i className="fas fa-gas-pump mr-2"></i>Nhiên liệu
                        </NavLink>
                        <NavLink to="/trunk" className={navLinkClass}>
                            <i className="fas fa-truck-loading mr-2"></i>Kiểm tra cốp
                        </NavLink>
                        {/* THÊM LẠI LINK NÀY */}
                        <NavLink to="/history" className={navLinkClass}>
                            <i className="fas fa-history mr-2"></i>Lịch sử & Thống kê
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
}