import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const BACKEND_URL = "http://localhost:3000";

const INITIAL_DATA = {
    location: { lat: 10.7769, lng: 106.7009 },
    fuel: 0,
    trunk: "closed",
    lastUpdate: new Date().toISOString(),
};

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// ==========================================================
// HÀM HELPER TÍNH KHOẢNG CÁCH (LẤY TỪ BE)
// ==========================================================
/**
 * Tính khoảng cách giữa 2 điểm (km)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0088; // Bán kính trung bình Trái Đất (km)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 1000) / 1000; // Làm tròn đến 3 chữ số (mét)
}

/**
 * Tính tổng quãng đường từ một mảng các tọa độ
 * @param {Array} path - Mảng các object {lat, lng}
 * @returns {number} Tổng quãng đường (km)
 */
function calculateTotalDistance(path) {
    let totalDistance = 0;
    // Lặp qua mảng, bắt đầu từ điểm thứ 2
    for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];

        // Tính khoảng cách giữa điểm trước và điểm hiện tại
        totalDistance += calculateDistance(
            prevPoint.lat, prevPoint.lng,
            currentPoint.lat, currentPoint.lng
        );
    }
    return totalDistance;
}
// ==========================================================


export const DataProvider = ({ children }) => {
    // --- State Dữ liệu (Giữ nguyên) ---
    const [currentStatus, setCurrentStatus] = useState(INITIAL_DATA);
    const [historyData, setHistoryData] = useState({
        locations: [],
        fuel: [],
        trunkEvents: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null);
    const prevTrunkStatus = useRef(currentStatus.trunk);

    // --- State Phiên (Session) ---
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentSession, setCurrentSession] = useState({
        startTime: null,
        trunkOpenCount: 0,
        startFuel: 0, // <-- THÊM MỚI: Xăng lúc bắt đầu
        pathHistory: [], // <-- THÊM MỚI: Mảng lưu lộ trình
    });
    const [sessionHistory, setSessionHistory] = useState([]);


    const transformTrunkStatus = (status) => {
        return status === 0 ? 'opened' : 'closed';
    };

    // --- EFFECT CHÍNH: KẾT NỐI API VÀ SOCKET ---
    useEffect(() => {

        async function fetchInitialData() {
            try {
                const statusRes = await fetch(`${BACKEND_URL}/api/vehicle/status`);
                const statusData = await statusRes.json();

                if (statusData.success && statusData.vehicle && statusData.vehicle.location) {
                    const { vehicle } = statusData;
                    const lat = vehicle.location.latitude || 0;
                    const lng = vehicle.location.longitude || 0;

                    setCurrentStatus({
                        location: { lat: lat, lng: lng },
                        fuel: vehicle.fuelLevel,
                        trunk: transformTrunkStatus(vehicle.trunkStatus),
                        lastUpdate: vehicle.timestamp,
                    });
                    prevTrunkStatus.current = transformTrunkStatus(vehicle.trunkStatus);
                } else {
                    console.warn("fetchInitialData không có dữ liệu location, dùng dữ liệu mặc định.");
                }

                // (Fetch fuel/trunk history giữ nguyên)
                const fuelRes = await fetch(`${BACKEND_URL}/api/vehicle/fuel-history?limit=100`);
                const fuelData = await fuelRes.json();
                const trunkRes = await fetch(`${BACKEND_URL}/api/vehicle/trunk-history?limit=100`);
                const trunkData = await trunkRes.json();
                setHistoryData({
                    locations: [],
                    fuel: fuelData.data.reverse().map(d => ({ time: new Date(d.timestamp).toLocaleTimeString(), level: d.level })),
                    trunkEvents: trunkData.data.reverse().map(d => ({ time: new Date(d.timestamp).toLocaleTimeString(), status: transformTrunkStatus(d.status) }))
                });

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu ban đầu:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchInitialData();

        // --- Kết nối WebSocket (Socket.IO) ---
        socketRef.current = io(BACKEND_URL);
        const socket = socketRef.current;
        socket.on("connect", () => console.log("Đã kết nối tới Backend Socket.IO! ID:", socket.id));

        socket.on("statusUpdate", ({ vehicle, alerts }) => {

            if (vehicle && vehicle.location) {
                const lat = vehicle.location.latitude || 0;
                const lng = vehicle.location.longitude || 0;

                const newStatus = {
                    location: { lat: lat, lng: lng },
                    fuel: vehicle.fuelLevel,
                    trunk: transformTrunkStatus(vehicle.trunkStatus),
                    lastUpdate: vehicle.timestamp,
                };
                setCurrentStatus(newStatus);

                // ===============================================
                // NÂNG CẤP: Nếu phiên đang chạy, lưu lại lộ trình
                // ===============================================
                if (isSessionActive) {
                    setCurrentSession(session => ({
                        ...session,
                        // Thêm tọa độ mới vào mảng lộ trình
                        pathHistory: [...session.pathHistory, newStatus.location]
                    }));
                }
                // ===============================================

                // (Cập nhật historyData)
                setHistoryData(prev => ({
                    // ... (giữ nguyên)
                    locations: prev.locations,
                    fuel: [
                        ...prev.fuel,
                        { time: new Date(newStatus.lastUpdate).toLocaleTimeString(), level: newStatus.fuel }
                    ].slice(-100),
                    trunkEvents: newStatus.trunk !== (prev.trunkEvents[prev.trunkEvents.length - 1]?.status || 'closed')
                        ? [
                            ...prev.trunkEvents,
                            { time: new Date(newStatus.lastUpdate).toLocaleTimeString(), status: newStatus.trunk }
                        ].slice(-100)
                        : prev.trunkEvents
                }));
            } else {
                console.warn("Nhận được statusUpdate nhưng thiếu 'vehicle.location'", vehicle);
            }
        });

        socket.on("disconnect", () => console.log("Đã ngắt kết nối Socket.IO"));

        return () => {
            console.log("Ngắt kết nối Socket.IO");
            socket.disconnect();
        };
    }, [isSessionActive]); // <-- Thêm isSessionActive vào dependency

    // --- EFFECT Đếm số lần mở cốp (Logic này vẫn đúng) ---
    useEffect(() => {
        if (isLoading) return;
        if (currentStatus.trunk === 'opened' && prevTrunkStatus.current === 'closed') {
            if (isSessionActive) {
                setCurrentSession(session => ({
                    ...session,
                    trunkOpenCount: session.trunkOpenCount + 1
                }));
            }
        }
        prevTrunkStatus.current = currentStatus.trunk;
    }, [currentStatus.trunk, isSessionActive, isLoading]);

    // --- HÀM BẮT ĐẦU / KẾT THÚC (Nâng cấp) ---

    const formatDuration = (startTime, endTime) => {
        let seconds = Math.floor((endTime - startTime) / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // NÂNG CẤP HÀM START
    const startSession = () => {
        console.log("FE: Bắt đầu phiên theo dõi mới...");
        setIsSessionActive(true);
        // Lấy trạng thái HIỆN TẠI để lưu lại
        const { fuel, location } = currentStatus;
        setCurrentSession({
            startTime: new Date(),
            startFuel: fuel, // <-- LƯU XĂNG (ml)
            pathHistory: [location], // <-- LƯU ĐIỂM BẮT ĐẦU
            trunkOpenCount: 0,
        });
    };

    // NÂNG CẤP HÀM STOP
    const stopSession = () => {
        if (!isSessionActive) return;

        console.log("FE: Kết thúc phiên. Đang tính toán...");
        const endTime = new Date();
        const endFuel = currentStatus.fuel; // Lấy xăng (ml) lúc kết thúc
        const { startTime, startFuel, trunkOpenCount, pathHistory } = currentSession;

        // Tính toán thống kê
        const totalFuelConsumed = Math.max(0, startFuel - endFuel); // Xăng tiêu thụ (ml)
        const totalDistanceKm = calculateTotalDistance(pathHistory); // Quãng đường (km)

        // Tạo bản ghi thống kê mới
        const newSessionRecord = {
            id: sessionHistory.length + 1,
            startTime: startTime.toLocaleString('vi-VN'),
            endTime: endTime.toLocaleString('vi-VN'),
            totalTime: formatDuration(startTime, endTime),
            trunkOpenCount: trunkOpenCount,
            totalFuelConsumed: totalFuelConsumed, // <-- Thống kê mới
            totalDistanceKm: totalDistanceKm, // <-- Thống kê mới
        };

        console.log("Thống kê phiên:", newSessionRecord);
        setSessionHistory(prevHistory => [newSessionRecord, ...prevHistory]);

        // Reset trạng thái
        setIsSessionActive(false);
        setCurrentSession({
            startTime: null,
            trunkOpenCount: 0,
            startFuel: 0,
            pathHistory: [],
        });
    };

    const value = {
        currentStatus,
        historyData,
        isLoading,
        isSessionActive,
        currentSession,
        sessionHistory,
        startSession,
        stopSession,
    };

    return (
        <DataContext.Provider value={value}>{children}</DataContext.Provider>
    );
};