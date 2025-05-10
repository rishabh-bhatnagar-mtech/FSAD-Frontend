import React, { useState, useEffect } from 'react';
import './student_management.css';

const stubbedStudentsResponse = [
    {
        id: 'STU1001',
        name: 'Aarav',
        class: '10th',
        vaccines: ['Covishield', 'Covaxin'],
    },
    {
        id: 'STU1002',
        name: 'Isha',
        class: '12th',
        vaccines: ['Covishield'],
    },
    {
        id: 'STU1003',
        name: 'Rohan',
        class: '11th',
        vaccines: [],
    },
    {
        id: 'STU1004',
        name: 'Sneha',
        class: '9th',
        vaccines: ['Covaxin'],
    },
    {
        id: 'STU1005',
        name: 'Karan',
        class: '10th',
        vaccines: ['Covishield', 'Sputnik'],
    },
];

const fetchStubbedStudents = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(stubbedStudentsResponse);
        }, 1000);
    });

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [vaccineTypes, setVaccineTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await fetchStubbedStudents();
                setStudents(data);
                const vaccinesSet = new Set();
                data.forEach(student => {
                    student.vaccines.forEach(vaccine => vaccinesSet.add(vaccine));
                });
                setVaccineTypes(Array.from(vaccinesSet).sort());
                setError(null);
            } catch {
                setError('Failed to fetch student data');
                setStudents([]);
                setVaccineTypes([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    if (loading) return <div className="content"><p>Loading students...</p></div>;
    if (error) return <div className="content"><p>Error: {error}</p></div>;

    return (
        <div className="content">
            <h1>Student Management</h1>
            <table>
                <thead>
                <tr>
                    <th rowSpan="2">Sr No</th>
                    <th rowSpan="2">Name</th>
                    <th rowSpan="2">ID</th>
                    <th rowSpan="2">Class</th>
                    <th colSpan={vaccineTypes.length} style={{ textAlign: 'center' }}>Vaccines</th>
                    <th rowSpan="2">Actions</th>
                </tr>
                <tr>
                    {vaccineTypes.map(vaccine => (
                        <th key={vaccine}>{vaccine}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {students.map((student, idx) => (
                    <tr key={student.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td>{idx + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.id}</td>
                        <td>{student.class}</td>
                        {vaccineTypes.map(vaccine => (
                            <td key={vaccine} aria-label={`${student.name} vaccinated with ${vaccine}`}>
                                {student.vaccines.includes(vaccine) ? 'Yes' : 'No'}
                            </td>
                        ))}
                        <td>
                            <button className="action-button" onClick={() => {}}>
                                Actions
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentManagement;
