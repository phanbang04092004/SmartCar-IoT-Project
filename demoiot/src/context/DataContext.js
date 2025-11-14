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
    const prevTrunkStatus = useRef(currentStatus.trunk); // Dùng để đếm số lần mở cốp

    // --- State MỚI cho Phiên (Session) ---
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentSession, setCurrentSession] = useState({
        startTime: null,
        trunkOpenCount: 0,
    });
    // Lưu trữ lịch sử các phiên (CHỈ Ở FE)
    const [sessionHistory, setSessionHistory] = useState([]);


    const transformTrunkStatus = (status) => {
        return status === 1 ? 'opened' : 'closed';
    };

    // --- EFFECT CHÍNH: KẾT NỐI API VÀ SOCKET (Giữ nguyên) ---
    useEffect(() => {

        async function fetchInitialData() {
            try {
                // (A) Lấy trạng thái hiện tại
                const statusRes = await fetch(`${BACKEND_URL}/api/vehicle/status`);
                const statusData = await statusRes.json();
                if (statusData.success) {
                    const { vehicle } = statusData;
                    setCurrentStatus({
                        location: {
                            lat: vehicle.location.latitude,
                            lng: vehicle.location.longitude,
                        },
                        fuel: vehicle.fuelLevel,
                        trunk: transformTrunkStatus(vehicle.trunkStatus),
                        lastUpdate: vehicle.timestamp,
                    });
                    // Cập nhật trạng thái cốp ban đầu
                    prevTrunkStatus.current = transformTrunkStatus(vehicle.trunkStatus);
                }

                // (B) Lấy lịch sử xăng
                const fuelRes = await fetch(`${BACKEND_URL}/api/vehicle/fuel-history?limit=100`);
                const fuelData = await fuelRes.json();

                // (C) Lấy lịch sử cốp
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

        socket.on("connect", () => {
            console.log("Đã kết nối tới Backend Socket.IO! ID:", socket.id);
        });

        socket.on("statusUpdate", ({ vehicle, alerts }) => {
            const newStatus = {
                location: {
                    lat: vehicle.location.latitude,
                    lng: vehicle.location.longitude,
                },
                fuel: vehicle.fuelLevel,
                trunk: transformTrunkStatus(vehicle.trunkStatus),
                lastUpdate: vehicle.timestamp,
            };
            setCurrentStatus(newStatus); // Cập nhật trạng thái real-time

            // (Phần cập nhật lịch sử chart giữ nguyên)
            setHistoryData(prev => ({
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
        });

        socket.on("disconnect", () => console.log("Đã ngắt kết nối Socket.IO"));

        return () => {
            console.log("Ngắt kết nối Socket.IO");
            socket.disconnect();
        };
    }, []);

    // --- EFFECT MỚI: Đếm số lần mở cốp KHI phiên đang chạy ---
    useEffect(() => {
        // Chỉ chạy nếu currentStatus đã được tải
        if (isLoading) return;

        // Nếu trạng thái cốp vừa chuyển thành 'opened'
        if (currentStatus.trunk === 'opened' && prevTrunkStatus.current === 'closed') {
            if (isSessionActive) {
                // Tăng bộ đếm của phiên HIỆN TẠI
                setCurrentSession(session => ({
                    ...session,
                    trunkOpenCount: session.trunkOpenCount + 1
                }));
            }
        }
        // Luôn cập nhật trạng thái cốp trước đó
        prevTrunkStatus.current = currentStatus.trunk;

    }, [currentStatus.trunk, isSessionActive, isLoading]); // Chạy mỗi khi trạng thái cốp hoặc phiên thay đổi

    // --- HÀM BẮT ĐẦU / KẾT THÚC (Chỉ chạy ở FE) ---

    // Hàm tính toán thời gian (vd: 1h 30m 15s)
    const formatDuration = (startTime, endTime) => {
        let seconds = Math.floor((endTime - startTime) / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const startSession = () => {
        console.log("FE: Bắt đầu phiên theo dõi mới...");
        setIsSessionActive(true);
        setCurrentSession({
            startTime: new Date(), // Ghi lại thời điểm bắt đầu
            trunkOpenCount: 0,      // Reset bộ đếm
        });
    };

    const stopSession = () => {
        if (!isSessionActive) return;

        console.log("FE: Kết thúc phiên.");
        const endTime = new Date();
        const { startTime, trunkOpenCount } = currentSession;

        // Tạo bản ghi thống kê mới
        const newSessionRecord = {
            id: sessionHistory.length + 1,
            startTime: startTime.toLocaleString('vi-VN'),
            endTime: endTime.toLocaleString('vi-VN'),
            totalTime: formatDuration(startTime, endTime), // Tính tổng thời gian
            trunkOpenCount: trunkOpenCount, // Tổng số lần mở (đếm được ở FE)
        };

        // Lưu vào lịch sử (đưa cái mới nhất lên đầu)
        setSessionHistory(prevHistory => [newSessionRecord, ...prevHistory]);

        // Reset trạng thái
        setIsSessionActive(false);
        setCurrentSession({ startTime: null, trunkOpenCount: 0 });
    };

    const value = {
        currentStatus,
        historyData,
        isLoading,
        // Xuất các state và hàm mới ra
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