import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Menu</h2>
            <ul>
                <li>
                    <NavLink to="/vaccine-drive" className={({ isActive }) => (isActive ? 'active' : '')}>
                        Vaccination Drive Management
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/student-management" className={({ isActive }) => (isActive ? 'active' : '')}>
                        Student Management
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
