import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Sidebar from './sidebar';
import VaccineDrive from "./vaccine_drive";
import './App.css';
import Dashboard from "./dashboard";
import StudentManagement from "./student_management";


const App = () => {
    return (
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
                            <Route path="/vaccine-drive" element={<VaccineDrive/>}/>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="/student-management" element={<StudentManagement/>}/>
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;
