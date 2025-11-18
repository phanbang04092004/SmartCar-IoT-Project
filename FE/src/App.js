import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page Components
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import FuelPage from "./pages/FuelPage";
import TrunkPage from "./pages/TrunkPage";
import HistoryPage from "./pages/HistoryPage"; // <-- THÊM LẠI DÒNG NÀY

function App() {
    return (
        <DataProvider>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-gray-100">
                    <Header />
                    <main className="flex-grow pt-36">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/fuel" element={<FuelPage />} />
                            <Route path="/trunk" element={<TrunkPage />} />
                            <Route path="/history" element={<HistoryPage />} /> {/* <-- THÊM LẠI DÒNG NÀY */}
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </DataProvider>
    );
}

export default App;