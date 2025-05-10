import React, { useState, useEffect } from 'react';

const stubbedResponse = {
    totalStudents: 500,
    vaccinatedStudents: 350,
    unvaccinatedStudents: 150,
};

const fetchStubbedStats = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(stubbedResponse);
        }, 1000);
    });

const VaccineDrive = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await fetchStubbedStats();
                setStats(data);
                setError(null);
            } catch {
                setError('Failed to fetch vaccine drive stats');
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="content"><p>Loading vaccine drive stats...</p></div>;
    if (error) return <div className="content"><p>Error: {error}</p></div>;

    return (
        <div className="content">
            <h1>Vaccination Drive Management</h1>
            <ul>
                <li>Total Students: {stats.totalStudents}</li>
                <li>Vaccinated Students: {stats.vaccinatedStudents}</li>
                <li>Unvaccinated Students: {stats.unvaccinatedStudents}</li>
            </ul>
        </div>
    );
};

export default VaccineDrive;
