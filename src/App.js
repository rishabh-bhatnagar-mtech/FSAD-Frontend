import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Sidebar from './sidebar';
import VaccineDrive from "./vaccine_drive";
import './App.css';
import StudentManagement from "./student_management";
import AuthGate from './login.js';
import Dashboard from "./dashboard";
import Reports from "./report.js"

const App = () => {
    return (
        <AuthGate>
            <Router>
                <div className="app">
                    <Sidebar/>
                    <div className="main-area">
                        <header className="topbar">
                            <div className="profile-circle" title="Robert Brown">RB</div>
                        </header>
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                                <Route path="/dashboard" element={<Dashboard/>}/>
                                <Route path="/vaccine-drive" element={<VaccineDrive/>}/>
                                <Route path="/student-management" element={<StudentManagement/>}/>
                                <Route path="/reports" element={<Reports/>}/>
                            </Routes>
                        </main>
                    </div>
                </div>
            </Router>
        </AuthGate>
    );
};

export default App;
