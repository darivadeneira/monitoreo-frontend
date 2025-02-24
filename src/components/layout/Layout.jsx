import React from "react";
import Footer from "../shared/Footer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SystemResources from "../SystemResources";
import Nav from "../shared/Nav";
import Sidebar from "../shared/Sidebar";

const Layout = () => {
    return (
        <Router>
            <div className="flex min-h-screen flex-col">
                <Nav />
                <div className="flex flex-1 p-4 bg-gray-50">
                    {/* Sidebar a la izquierda con ancho fijo */}
                    <Sidebar />

                    {/* Contenedor de contenido principal */}
                    <main className="flex-1 p-4 bg-gray-50">
                        <Routes>
                            <Route path="/" element={<Navigate to="/overview" />} />
                            <Route path="/overview" element={<SystemResources view="overview" />} />
                            <Route path="/cpu" element={<SystemResources view="cpu" />} />
                            <Route path="/memory" element={<SystemResources view="memory" />} />
                            <Route path="/network" element={<SystemResources view="network" />} />
                            <Route path="*" element={<Navigate to="/overview" />} />
                        </Routes>
                    </main>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default Layout;
