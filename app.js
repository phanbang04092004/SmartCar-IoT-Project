const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const apiRoutes = require('./src/api');
const MqttService = require('./src/services/mqttService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors()); // Enable CORS cho Frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Vehicle Tracking Backend API',
        version: '1.0.0',
        documentation: '/api'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại',
        path: req.path
    });
});

// Error handlers
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});
io.on('connection', (socket) => {
    console.log('FE connected', socket.id);

    socket.on('disconnect', () => {
        console.log('FE disconnected', socket.id);
    });
});

// Make io accessible từ MqttService
global.io = io;

// Khởi động MQTT Service
console.log('🚀 Đang khởi động MQTT Service...');
MqttService.init();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Đang shutdown server...');
    MqttService.close();
    process.exit(0);
});

// Start HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`🚀 Server đang chạy trên port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════\n');
});

module.exports = app;