import React, {useEffect, useState} from 'react';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';

const stubbedStatsResponse = {
    totalStudents: 500,
    vaccinatedStudents: 350,
    unvaccinatedStudents: 150,
};

const stubbedDrivesResponse = [
    {id: 1, date: '2025-05-15', dosesAvailable: 100, applicableClass: '10th'},
    {id: 2, date: '2025-06-01', dosesAvailable: 150, applicableClass: '12th'},
    {id: 3, date: '2025-07-10', dosesAvailable: 200, applicableClass: '11th'}, // outside 30 days
];

const fetchStubbedStats = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(stubbedStatsResponse);
        }, 1000);
    });

const fetchStubbedDrives = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(stubbedDrivesResponse);
        }, 1000);
    });

const COLORS = ['#1abc9c', '#e74c3c'];

const VaccineDrive = () => {
    const [stats, setStats] = useState(null);
    const [drives, setDrives] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingDrives, setLoadingDrives] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [errorDrives, setErrorDrives] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await fetchStubbedStats();
                setStats(data);
                setErrorStats(null);
            } catch {
                setErrorStats('Failed to fetch vaccine drive stats');
                setStats(null);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchDrives = async () => {
            try {
                const data = await fetchStubbedDrives();

                const today = new Date();
                const in30Days = new Date();
                in30Days.setDate(today.getDate() + 30);

                const upcoming = data.filter(drive => {
                    const driveDate = new Date(drive.date);
                    return driveDate >= today && driveDate <= in30Days;
                });

                setDrives(upcoming);
                setErrorDrives(null);
            } catch {
                setErrorDrives('Failed to fetch upcoming drives');
                setDrives([]);
            } finally {
                setLoadingDrives(false);
            }
        };

        fetchStats();
        fetchDrives();
    }, []);

    if (loadingStats || loadingDrives) return <div className="content"><p>Loading vaccine drive data...</p></div>;
    if (errorStats) return <div className="content"><p>Error: {errorStats}</p></div>;
    if (errorDrives) return <div className="content"><p>Error: {errorDrives}</p></div>;

    const pieData = [
        {name: 'Vaccinated', value: stats.vaccinatedStudents},
        {name: 'Unvaccinated', value: stats.unvaccinatedStudents},
    ];

    return (
        <div className="content">
            <h1>Vaccination Drive Management</h1>
            <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
                <div style={{width: 300, height: 300}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <table style={{borderCollapse: 'collapse', width: '300px'}}>
                    <thead>
                    <tr>
                        <th style={{borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px'}}>Category</th>
                        <th style={{borderBottom: '1px solid #ddd', textAlign: 'right', padding: '8px'}}>Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td style={{padding: '8px'}}>Total Students</td>
                        <td style={{padding: '8px', textAlign: 'right'}}>{stats.totalStudents}</td>
                    </tr>
                    <tr>
                        <td style={{padding: '8px'}}>Vaccinated Students</td>
                        <td style={{padding: '8px', textAlign: 'right'}}>{stats.vaccinatedStudents}</td>
                    </tr>
                    <tr>
                        <td style={{padding: '8px'}}>Unvaccinated Students</td>
                        <td style={{padding: '8px', textAlign: 'right'}}>{stats.unvaccinatedStudents}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <h2 style={{marginTop: '2rem'}}>Upcoming Vaccination Drives (Next 30 Days)</h2>
            {drives.length === 0 ? (
                <p>No upcoming drives in the next 30 days.</p>
            ) : (
                <table style={{borderCollapse: 'collapse', width: '100%', maxWidth: '700px'}}>
                    <thead>
                    <tr>
                        <th style={{borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Sr No</th>
                        <th style={{borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Date</th>
                        <th style={{borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Doses
                            Available
                        </th>
                        <th style={{borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Applicable
                            Class
                        </th>
                        <th style={{borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Edit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {drives.map((drive, index) => (
                        <tr key={drive.id}>
                            <td style={{padding: '8px'}}>{index + 1}</td>
                            <td style={{padding: '8px'}}>{new Date(drive.date).toLocaleDateString()}</td>
                            <td style={{padding: '8px'}}>{drive.dosesAvailable}</td>
                            <td style={{padding: '8px'}}>{drive.applicableClass}</td>
                            <td style={{padding: '8px'}}>
                                <button
                                    style={{
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => {
                                    }}
                                    aria-label={`Edit drive ${drive.name}`}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VaccineDrive;
