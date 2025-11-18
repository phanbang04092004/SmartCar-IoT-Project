import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.js";
import { useMap } from "react-leaflet";

// Cấu hình icon (giống MapComponent)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/**
 * Component này sẽ vẽ đường đi trên bản đồ
 * @param {object} props
 * @param {L.LatLng} props.start - Tọa độ điểm bắt đầu
 * @param {L.LatLng} props.end - Tọa độ điểm kết thúc
 */
export default function RoutingComponent({ start, end }) {
    const map = useMap(); // Lấy instance của bản đồ

    useEffect(() => {
        if (!map || !start || !end) return; // Không làm gì nếu thiếu dữ liệu

        // Tạo control chỉ đường
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start.lat, start.lng), // Điểm A
                L.latLng(end.lat, end.lng)      // Điểm B
            ],
            routeWhileDragging: false, // Không tính lại đường khi kéo
            addWaypoints: false,       // Không cho phép người dùng thêm điểm
            draggableWaypoints: false, // Không cho phép kéo điểm
            fitSelectedRoutes: true,   // Tự động zoom vào đường đi
            show: true,              // Hiển thị bảng chỉ dẫn

            // Dùng dịch vụ GraphHopper (thay cho OSRM mặc định)
            router: new L.Routing.GraphHopper(undefined, {
                serviceUrl: 'https://graphhopper.com/api/1/route'
            }),

            // Tùy chỉnh hiển thị
            lineOptions: {
                styles: [{ color: '#007bff', opacity: 0.8, weight: 6 }]
            }
        }).addTo(map);

        // Khi component bị xóa, hãy xóa luôn control này khỏi bản đồ
        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, start, end]); // Chạy lại mỗi khi map, start, hoặc end thay đổi

    return null; // Component này không render HTML
}