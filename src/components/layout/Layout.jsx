import React from "react";
import Footer from "../shared/Footer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SystemResources from "../SystemResources";
import Nav from "../shared/Nav";
import Sidebar from "../shared/Sidebar";

export const Layout = () => {
    return (
        <Router>
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-col flex-1 ml-64">
                    <Nav />
                    <main className="flex-1 p-4 bg-gray-50">
                        <Routes>
                            <Route path="/overview" element={<SystemResources view="overview" />} />
                            <Route path="/cpu" element={<SystemResources view="cpu" />} />
                            <Route path="/memory" element={<SystemResources view="memory" />} />
                            <Route path="/" element={<Navigate to="/overview" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </Router>
    );
};