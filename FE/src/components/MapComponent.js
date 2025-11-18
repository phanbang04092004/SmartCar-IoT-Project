import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    LayersControl,
    useMap // <-- IMPORT THÊM useMap
} from "react-leaflet";
import L from "leaflet";

// (Phần fix icon Leaflet giữ nguyên)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// (Phần tileLayers giữ nguyên)
const tileLayers = {
    street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri'
    },
    terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: 'Map data: &copy; OpenTopoMap'
    }
};

// ==========================================================
// COMPONENT MỚI ĐỂ SỬA LỖI ZOOM
// ==========================================================
// Component này nằm bên trong MapContainer, nó dùng hook 'useMap'
// để lấy instance của bản đồ và ra lệnh cho nó.
function MapUpdater({ location }) {
    const map = useMap(); // Lấy map instance

    useEffect(() => {
        // Khi 'location' thay đổi,
        // 'flyTo' (bay) đến vị trí mới,
        // nhưng 'map.getZoom()' sẽ giữ nguyên mức zoom hiện tại của người dùng.
        map.flyTo([location.lat, location.lng], map.getZoom());
    }, [location, map]); // Chỉ chạy khi location hoặc map thay đổi

    return null; // Component này không render gì cả
}
// ==========================================================


export default function MapComponent({ location, pathHistory = [], children }) {

    // BỎ const mapKey = JSON.stringify(location);

    return (
        <MapContainer
            // BỎ key={mapKey} KHỎI ĐÂY
            center={[location.lat, location.lng]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            {/* Bộ chọn lớp bản đồ (Giữ nguyên) */}
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Bản đồ đường (Street)">
                    <TileLayer
                        url={tileLayers.street.url}
                        attribution={tileLayers.street.attribution}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Bản đồ vệ tinh (Satellite)">
                    <TileLayer
                        url={tileLayers.satellite.url}
                        attribution={tileLayers.satellite.attribution}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Bản đồ địa hình (Terrain)">
                    <TileLayer
                        url={tileLayers.terrain.url}
                        attribution={tileLayers.terrain.attribution}
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            {/* THÊM COMPONENT SỬA LỖI VÀO ĐÂY */}
            <MapUpdater location={location} />

            {/* Marker xe (Giữ nguyên) */}
            <Marker position={[location.lat, location.lng]}>
                <Popup>Vị trí hiện tại</Popup>
            </Marker>

            {/* Lộ trình (Giữ nguyên) */}
            {pathHistory.length > 0 && (
                <Polyline
                    pathOptions={{ color: "blue", weight: 5 }}
                    positions={pathHistory}
                />
            )}

            {/* Chỗ này để hiển thị các trạm xăng (Giữ nguyên) */}
            {children}

        </MapContainer>
    );
}