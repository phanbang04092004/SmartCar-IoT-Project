import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // <-- IMPORT FILE CSS NÀY
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'leaflet/dist/leaflet.css';
import App from './App';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "lrm-graphhopper"; // Import dịch vụ định tuyến
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);