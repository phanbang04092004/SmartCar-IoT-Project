const axios = require('axios');

class GasStationService {
    
    /**
     * Tìm trạm xăng gần nhất sử dụng Overpass API (OpenStreetMap)
     * @param {number} latitude - Vĩ độ
     * @param {number} longitude - Kinh độ
     * @param {number} radius - Bán kính (mét)
     * @param {number} limit - Số lượng trạm tối đa
     * @returns {Promise<Array>} Danh sách trạm xăng
     */
    static async findNearestGasStations(latitude, longitude, radius = 4000, limit = 10) {
        try {
            console.log(`🔍 Tìm trạm xăng gần vị trí: ${latitude}, ${longitude} (bán kính ${radius}m)`);

            // Overpass API query
            const overpassQuery = `
                [out:json][timeout:25];
                (
                    node["amenity"="fuel"](around:${radius},${latitude},${longitude});
                    way["amenity"="fuel"](around:${radius},${latitude},${longitude});
                    relation["amenity"="fuel"](around:${radius},${latitude},${longitude});
                );
                out body;
                >;
                out skel qt;
            `;

            // Gọi Overpass API
            const response = await axios.post(
                'https://overpass-api.de/api/interpreter',
                overpassQuery,
                {
                    headers: { 'Content-Type': 'text/plain' },
                    timeout: 30000
                }
            );

            const elements = response.data.elements;

            if (!elements || elements.length === 0) {
                console.log('⚠️ Không tìm thấy trạm xăng, sử dụng dữ liệu dự phòng');
                return this.getFallbackStations(latitude, longitude);
            }

            // Xử lý dữ liệu trạm xăng
            const gasStations = elements
                .filter(el => el.lat && el.lon && el.tags)
                .map(station => {
                    const distance = this.calculateDistance(
                        latitude, longitude,
                        station.lat, station.lon
                    );

                    return {
                        id: station.id,
                        name: station.tags.name || station.tags.brand || 'Trạm xăng',
                        brand: station.tags.brand || station.tags.operator || null,
                        address: station.tags['addr:street'] || station.tags['addr:full'] || null,
                        latitude: station.lat,
                        longitude: station.lon,
                        distance: distance,
                        distanceM: Math.round(distance * 1000), // Thêm distanceM để dễ so sánh
                        distanceText: distance < 1 
                            ? `${Math.round(distance * 1000)}m` 
                            : `${distance.toFixed(2)}km`,
                        travelTime: Math.ceil(distance / 40 * 60),
                        phone: station.tags.phone || null,
                        website: station.tags.website || null,
                        openingHours: station.tags.opening_hours || null,
                        fuel_types: this.extractFuelTypes(station.tags),
                        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`,
                        osmUrl: `https://www.openstreetmap.org/${station.type}/${station.id}`
                    };
                })
                .filter(station => station.distanceM <= radius) // Lọc theo mét
                .sort((a, b) => a.distanceM - b.distanceM)
                .slice(0, limit);

            console.log(`✅ Tìm thấy ${gasStations.length} trạm xăng`);
            return gasStations;

        } catch (error) {
            console.error('❌ Lỗi khi tìm trạm xăng:', error.message);
            
            if (error.code === 'ECONNABORTED' || error.response?.status === 429) {
                console.log('⚠️ API quá tải, sử dụng dữ liệu mẫu');
                return this.getFallbackStations(latitude, longitude);
            }
            
            throw error;
        }
    }

    /**
     * Trích xuất các loại xăng
     */
    static extractFuelTypes(tags) {
        const fuelTypes = [];
        
        if (tags['fuel:diesel'] === 'yes') fuelTypes.push('Diesel');
        if (tags['fuel:octane_95'] === 'yes') fuelTypes.push('Xăng 95');
        if (tags['fuel:octane_92'] === 'yes') fuelTypes.push('Xăng 92');
        if (tags['fuel:e5'] === 'yes') fuelTypes.push('E5');
        if (tags['fuel:lpg'] === 'yes') fuelTypes.push('LPG');
        
        return fuelTypes.length > 0 ? fuelTypes : null;
    }

    /**
     * Tính khoảng cách giữa 2 điểm sử dụng công thức Haversine (cải thiện độ chính xác)
     * @param {number} lat1 - Vĩ độ điểm 1
     * @param {number} lon1 - Kinh độ điểm 1
     * @param {number} lat2 - Vĩ độ điểm 2
     * @param {number} lon2 - Kinh độ điểm 2
     * @returns {number} Khoảng cách (km) với độ chính xác cao hơn
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        // Bán kính Trái Đất trung bình (km) - giá trị chính xác hơn
        const R = 6371.0088; // Bán kính trung bình (km)
        
        // Chuyển đổi sang radian
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        // Công thức Haversine
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Tính khoảng cách (km) - giữ nhiều chữ số thập phân để chính xác hơn
        const distance = R * c;
        
        // Làm tròn đến 3 chữ số thập phân (độ chính xác ~1m)
        return Math.round(distance * 1000) / 1000;
    }

    /**
     * Dữ liệu trạm xăng dự phòng (khi API lỗi)
     */
    static getFallbackStations(lat, lng) {
        const fallbackStations = [
            { 
                id: 'fallback-1', 
                name: 'Petrolimex Láng Hạ', 
                brand: 'Petrolimex',
                lat: 21.0145, 
                lng: 105.8220,
                address: 'Láng Hạ, Đống Đa, Hà Nội'
            },
            { 
                id: 'fallback-2', 
                name: 'Shell Nguyễn Trãi', 
                brand: 'Shell',
                lat: 21.0089, 
                lng: 105.8191,
                address: 'Nguyễn Trãi, Thanh Xuân, Hà Nội'
            },
            { 
                id: 'fallback-3', 
                name: 'Total Giảng Võ', 
                brand: 'Total',
                lat: 21.0278, 
                lng: 105.8235,
                address: 'Giảng Võ, Ba Đình, Hà Nội'
            }
        ];

        return fallbackStations.map(station => {
            const distance = this.calculateDistance(lat, lng, station.lat, station.lng);
            return {
                ...station,
                latitude: station.lat,
                longitude: station.lng,
                distance,
                distanceM: Math.round(distance * 1000),
                distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(2)}km`,
                travelTime: Math.ceil(distance / 40 * 60),
                googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`,
                fallback: true
            };
        }).sort((a, b) => a.distanceM - b.distanceM);
    }
}

module.exports = GasStationService;