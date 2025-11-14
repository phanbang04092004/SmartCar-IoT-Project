import React from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    LayersControl // <-- IMPORT THÊM
} from "react-leaflet";
import L from "leaflet"; // (Fix icon giữ nguyên)

// (Phần fix icon Leaflet giữ nguyên)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Các URL cho các lớp bản đồ
const tileLayers = {
    street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
};

export default function MapComponent({ location, pathHistory = [] }) {
    const mapKey = JSON.stringify(location);

    return (
        <MapContainer
            key={mapKey}
            center={[location.lat, location.lng]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            {/* Bộ chọn lớp bản đồ (Giống Google Maps) */}
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

            {/* Marker và Polyline giữ nguyên */}
            <Marker position={[location.lat, location.lng]}>
                <Popup>Vị trí hiện tại</Popup>
            </Marker>

            {pathHistory.length > 0 && (
                <Polyline
                    pathOptions={{ color: "blue", weight: 5 }}
                    positions={pathHistory.map((p) => [p.lat, p.lng])}
                />
            )}
        </MapContainer>
    );
}