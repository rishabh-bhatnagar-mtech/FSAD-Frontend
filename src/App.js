import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './sidebar';
import './App.css';

const VaccineDrive = () => <div className="content"><h1>Vaccination Drive Management</h1></div>;
const Dashboard = () => <div className="content"><h1>Dashboard</h1></div>;
const StudentManagement = () => <div className="content"><h1>Student Management</h1></div>;

const App = () => {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <div className="main-area">
                    <header className="topbar">
                        <div className="profile-circle" title="Robert Brown">RB</div>
                    </header>
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/vaccine-drive" element={<VaccineDrive />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/student-management" element={<StudentManagement />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;
