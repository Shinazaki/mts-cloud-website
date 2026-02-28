import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Header />
                <main className="dashboard-content">
                    <Outlet /> {/* Renders the current page content */}
                </main>
            </div>
        </div>
    );
};
