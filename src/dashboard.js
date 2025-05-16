import React, { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1abc9c', '#e74c3c'];
const BACKEND_URL = 'http://localhost:5000';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatsAndDrives = async () => {
            setLoading(true);
            try {
                const statsRes = await fetch(BACKEND_URL + '/dashboard/stats');
                const drivesRes = await fetch(BACKEND_URL + '/drives');
                if (!statsRes.ok || !drivesRes.ok) throw new Error('Failed to fetch data');
                const statsData = await statsRes.json();
                const drivesData = await drivesRes.json();
                setStats(statsData);

                const today = new Date();
                const in30Days = new Date();
                in30Days.setDate(today.getDate() + 30);
                const upcoming = drivesData.filter(drive => {
                    const driveDate = new Date(drive.date);
                    return driveDate >= today && driveDate <= in30Days;
                });
                setDrives(upcoming);
                setError(null);
            } catch (err) {
                setError('Failed to fetch dashboard data');
                setStats(null);
                setDrives([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStatsAndDrives();
    }, []);

    if (loading) return <div className="content"><p>Loading dashboard...</p></div>;
    if (error) return <div className="content"><p>Error: {error}</p></div>;

    const pieData = stats
        ? [
            { name: 'Vaccinated', value: stats.vaccinatedStudents },
            { name: 'Unvaccinated', value: stats.unvaccinatedStudents },
        ]
        : [];

    return (
        <div className="content">
            <h1>Dashboard</h1>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: 300, height: 300 }}>
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
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <table style={{ borderCollapse: 'collapse', width: '300px' }}>
                    <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: '8px' }}>Category</th>
                        <th style={{ borderBottom: '1px solid #ddd', textAlign: 'right', padding: '8px' }}>Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td style={{ padding: '8px' }}>Total Students</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{stats.totalStudents}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px' }}>Vaccinated Students</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{stats.vaccinatedStudents}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px' }}>Unvaccinated Students</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{stats.unvaccinatedStudents}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <h2 style={{ marginTop: '2rem' }}>Upcoming Vaccination Drives (Next 30 Days)</h2>
            {drives.length === 0 ? (
                <p>No upcoming drives in the next 30 days.</p>
            ) : (
                <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '700px' }}>
                    <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Sr No</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Doses Available</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Applicable Classes</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Vaccine Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {drives.map((drive, index) => (
                        <tr key={drive.id}>
                            <td style={{ padding: '8px' }}>{index + 1}</td>
                            <td style={{ padding: '8px' }}>{new Date(drive.date).toLocaleDateString()}</td>
                            <td style={{ padding: '8px' }}>{drive.doses_available}</td>
                            <td style={{ padding: '8px' }}>
                                {Array.isArray(drive.applicable_classes)
                                    ? drive.applicable_classes.join(', ')
                                    : drive.applicable_classes}
                            </td>
                            <td style={{ padding: '8px' }}>{drive.vaccine_name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard;
