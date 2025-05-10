import React from 'react';
import {NavLink} from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <h2>Menu</h2>
            <ul>
                <li>
                    <NavLink to="/" exact activeClassName="active">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/vaccine-drive" activeClassName="active">Vaccination Drive Management</NavLink>
                </li>
                <li>
                    <NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink>
                </li>
                <li>
                    <NavLink to="/student-management" activeClassName="active">Student Management</NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
