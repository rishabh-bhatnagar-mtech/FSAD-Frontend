import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

Modal.setAppElement('#root');

const COLORS = ['#1abc9c', '#e74c3c'];
const BACKEND_URL = 'http://localhost:5000';

const VaccineDrive = () => {
    const [stats, setStats] = useState(null);
    const [drives, setDrives] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingDrives, setLoadingDrives] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [errorDrives, setErrorDrives] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedDrive, setSelectedDrive] = useState(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        date: '',
        doses_available: '',
        applicable_classes: '',
        vaccine_name: '',
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const res = await fetch(BACKEND_URL + '/stats');
                if (!res.ok) throw new Error('Failed to fetch stats');
                const data = await res.json();
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
            setLoadingDrives(true);
            try {
                const res = await fetch(BACKEND_URL + '/drives');
                if (!res.ok) throw new Error('Failed to fetch drives');
                const data = await res.json();

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
                setErrorDrives('Failed to fetch drives');
                setDrives([]);
            } finally {
                setLoadingDrives(false);
            }
        };

        fetchStats();
        fetchDrives();
    }, []);

    const refreshDrives = async () => {
        setLoadingDrives(true);
        try {
            const res = await fetch(BACKEND_URL + '/drives');
            if (!res.ok) throw new Error('Failed to fetch drives');
            const data = await res.json();
            setDrives(data);
            setErrorDrives(null);
        } catch {
            setErrorDrives('Failed to fetch drives');
            setDrives([]);
        } finally {
            setLoadingDrives(false);
        }
    };

    const openAddModal = () => {
        setIsAddMode(true);
        setSelectedDrive(null);
        setFormData({
            id: '',
            name: '',
            date: '',
            doses_available: '',
            applicable_classes: '',
            vaccine_name: '',
        });
        setModalIsOpen(true);
    };

    const openModal = (drive) => {
        setIsAddMode(false);
        setSelectedDrive(drive);
        setFormData({
            id: drive.id || '',
            name: drive.name || '',
            date: drive.date || '',
            doses_available: drive.doses_available || '',
            applicable_classes: Array.isArray(drive.applicable_classes)
                ? drive.applicable_classes.join(',')
                : drive.applicable_classes || '',
            vaccine_name: drive.vaccine_name || '',
        });
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedDrive(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isAddMode) {
            try {
                const response = await fetch(BACKEND_URL + '/drives', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: formData.id,
                        name: formData.name,
                        date: formData.date,
                        doses_available: formData.doses_available,
                        applicable_classes: formData.applicable_classes,
                        vaccine_name: formData.vaccine_name
                    }),
                });
                if (!response.ok) throw new Error('Failed to add drive');
                await refreshDrives();
                closeModal();
            } catch (err) {
                alert(err.message);
            }
        } else {
            // Optionally implement edit here
            closeModal();
        }
    };

    if (loadingStats || loadingDrives)
        return <div className="content"><p>Loading vaccine drive data...</p></div>;
    if (errorStats) return <div className="content"><p>Error: {errorStats}</p></div>;
    if (errorDrives) return <div className="content"><p>Error: {errorDrives}</p></div>;

    const pieData = stats
        ? [
            { name: 'Vaccinated', value: stats.vaccinatedStudents },
            { name: 'Unvaccinated', value: stats.unvaccinatedStudents },
        ]
        : [];

    return (
        <div className="content">
            <h1>Vaccination Drive Management</h1>
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

            <div style={{ margin: '24px 0' }}>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#1abc9c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                    onClick={openAddModal}
                >
                    Add Drive
                </button>
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
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
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
                            <td style={{ padding: '8px' }}>
                                <button
                                    style={{
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => openModal(drive)}
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

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel={isAddMode ? "Add Vaccination Drive" : "Edit Vaccination Drive"}
                style={{
                    content: {
                        maxWidth: '400px',
                        margin: 'auto',
                        inset: '40px',
                        padding: '20px',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                }}
            >
                <h2>{isAddMode ? "Add Vaccination Drive" : "Edit Vaccination Drive"}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            ID:
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                                disabled={!isAddMode ? true : false}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Date:
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Number of Doses:
                            <input
                                type="number"
                                name="doses_available"
                                value={formData.doses_available}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                min="0"
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Applicable Classes:
                            <input
                                type="text"
                                name="applicable_classes"
                                value={formData.applicable_classes}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Vaccine Name:
                            <input
                                type="text"
                                name="vaccine_name"
                                value={formData.vaccine_name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={closeModal}
                            style={{ marginRight: '10px', padding: '6px 12px' }}
                        >
                            Cancel
                        </button>
                        <button type="submit" style={{
                            padding: '6px 12px',
                            backgroundColor: '#1abc9c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}>
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VaccineDrive;
