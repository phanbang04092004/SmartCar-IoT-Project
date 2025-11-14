const db = require('../config/database');

class TrackingService {

    static parseTrackingData(payload) {
        try {
            const parts = payload.trim().split(',');

            if (parts.length !== 6) {
                throw new Error(`Format không đúng: cần 6 trường, nhận được ${parts.length}`);
            }

            const [date, time, latitude, longitude, fuelLevel, trunkStatus] = parts;

            const [day, month, year] = date.split('/');
            const [hour, minute, second] = time.split(':');

            const mysqlTimestamp = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;

            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const fuel = parseInt(fuelLevel);
            const trunk = parseInt(trunkStatus);

            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Tọa độ không hợp lệ (NaN)');
            }
            if (lat < -90 || lat > 90) {
                throw new Error(`Vĩ độ phải trong khoảng [-90, 90], nhận được: ${lat}`);
            }
            if (lng < -180 || lng > 180) {
                throw new Error(`Kinh độ phải trong khoảng [-180, 180], nhận được: ${lng}`);
            }

            if (isNaN(fuel) || fuel < 0 || fuel > 100000) {
                throw new Error(`Mực xăng không hợp lệ: ${fuel}`);
            }

            if (trunk !== 0 && trunk !== 1) {
                throw new Error(`Trạng thái cốp phải là 0 hoặc 1, nhận được: ${trunk}`);
            }

            return {
                timestamp: mysqlTimestamp,
                location: {
                    latitude: lat,
                    longitude: lng
                },
                fuelLevel: fuel,
                trunkStatus: trunk,
                raw: payload
            };

        } catch (error) {
            console.error('Lỗi parse dữ liệu:', error.message);
            console.error('Payload:', payload);
            return null;
        }
    }

    static async saveTrackingData(data) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            await connection.execute(
                'INSERT INTO locations (timestamp, latitude, longitude) VALUES (?, ?, ?)', [data.timestamp, data.location.latitude, data.location.longitude]
            );
            console.log('  ✓ Đã lưu vị trí');

            await connection.execute(
                'INSERT INTO fuel_levels (timestamp, level) VALUES (?, ?)', [data.timestamp, data.fuelLevel]
            );
            console.log('  ✓ Đã lưu mực xăng');

            await connection.execute(
                'INSERT INTO trunk_status (timestamp, status) VALUES (?, ?)', [data.timestamp, data.trunkStatus]
            );
            console.log('  ✓ Đã lưu trạng thái cốp');

            await connection.commit();
            console.log('Đã lưu toàn bộ dữ liệu vào MySQL');
            return true;

        } catch (error) {
            await connection.rollback();
            console.error('Lỗi lưu database:', error.message);
            return false;
        } finally {
            connection.release();
        }
    }

    static async getLocationHistory(startTime, endTime, limit = 100) {
        try {
            let query = 'SELECT id, timestamp, latitude, longitude, created_at FROM locations WHERE 1=1';
            const params = [];
            if (startTime) {
                query += ' AND timestamp >= ?';
                params.push(startTime);
            }

            if (endTime) {
                query += ' AND timestamp <= ?';
                params.push(endTime);
            }
            query += ' ORDER BY timestamp DESC LIMIT ?';
            params.push(parseInt(limit));

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Lỗi query locations:', error.message);
            throw error;
        }
    }

    static async getCurrentLocation() {
        try {
            const [rows] = await db.execute(
                'SELECT id, timestamp, latitude, longitude, created_at FROM locations ORDER BY timestamp DESC LIMIT 1'
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Lỗi query current location:', error.message);
            throw error;
        }
    }

    static async getRouteData(startTime, endTime) {
        try {
            let query = `
                SELECT timestamp, latitude, longitude 
                FROM locations 
                WHERE timestamp BETWEEN ? AND ?
                ORDER BY timestamp ASC
            `;

            const [rows] = await db.execute(query, [startTime, endTime]);
            return rows;
        } catch (error) {
            console.error('Lỗi query route data:', error.message);
            throw error;
        }
    }
    // Lấy lịch sử mực xăng
// Lấy lịch sử mực xăng
static async getFuelHistory(limit = 100, startTime, endTime) {
    try {
        let query = 'SELECT id, timestamp, level, created_at FROM fuel_levels WHERE 1=1';
        const params = [];

        if (startTime) {
            query += ' AND timestamp >= ?';
            params.push(startTime);
        }
        if (endTime) {
            query += ' AND timestamp <= ?';
            params.push(endTime);
        }

        // validate limit
        limit = parseInt(limit);
        if (isNaN(limit) || limit <= 0) limit = 100;

        query += ` ORDER BY timestamp DESC LIMIT ${limit}`; // bind trực tiếp

        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Lỗi query fuel_levels:', error.message);
        throw error;
    }
}

// Lấy lịch sử trạng thái cốp
static async getTrunkHistory(limit = 100, startTime, endTime) {
    try {
        let query = 'SELECT id, timestamp, status, created_at FROM trunk_status WHERE 1=1';
        const params = [];

        if (startTime) {
            query += ' AND timestamp >= ?';
            params.push(startTime);
        }
        if (endTime) {
            query += ' AND timestamp <= ?';
            params.push(endTime);
        }

        // validate limit
        limit = parseInt(limit);
        if (isNaN(limit) || limit <= 0) limit = 100;

        query += ` ORDER BY timestamp DESC LIMIT ${limit}`; // bind trực tiếp

        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Lỗi query trunk_status:', error.message);
        throw error;
    }
}
}

module.exports = TrackingService;