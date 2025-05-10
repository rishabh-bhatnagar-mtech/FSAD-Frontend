import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';

const stubbedStatsResponse = {
    totalStudents: 500,
    vaccinatedStudents: 350,
    unvaccinatedStudents: 150,
};

const stubbedDrivesResponse = [
    {
        id: 1,
        name: 'Drive A',
        date: '2025-06-06',
        dosesAvailable: 100,
        applicableClass: '10th',
        vaccineName: 'Covishield'
    },
    {id: 2, name: 'Drive B', date: '2025-06-01', dosesAvailable: 150, applicableClass: '12th', vaccineName: 'Covaxin'},
    {id: 3, name: 'Drive C', date: '2025-07-10', dosesAvailable: 200, applicableClass: '11th', vaccineName: 'Sputnik'}, // outside 30 days
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

Modal.setAppElement('#root'); // Accessibility: bind modal to your app root

const VaccineDrive = () => {
    const [stats, setStats] = useState(null);
    const [drives, setDrives] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingDrives, setLoadingDrives] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [errorDrives, setErrorDrives] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedDrive, setSelectedDrive] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        dosesAvailable: '',
        applicableClass: '',
        vaccineName: '',
    });

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

    const openModal = (drive) => {
        setSelectedDrive(drive);
        setFormData({
            name: drive.name || '',
            dosesAvailable: drive.dosesAvailable || '',
            applicableClass: drive.applicableClass || '',
            vaccineName: drive.vaccineName || '',
        });
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedDrive(null);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, no action on submit
        closeModal();
    };

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
                contentLabel="Edit Vaccination Drive"
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
                <h2>Edit Vaccination Drive</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                required
                            />
                        </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Number of Doses:
                            <input
                                type="number"
                                name="dosesAvailable"
                                value={formData.dosesAvailable}
                                onChange={handleChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                min="0"
                                required
                            />
                        </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Applicable Classes:
                            <input
                                type="text"
                                name="applicableClass"
                                value={formData.applicableClass}
                                onChange={handleChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                required
                            />
                        </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Vaccine Name:
                            <input
                                type="text"
                                name="vaccineName"
                                value={formData.vaccineName}
                                onChange={handleChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                required
                            />
                        </label>
                    </div>
                    <div style={{textAlign: 'right'}}>
                        <button
                            type="button"
                            onClick={closeModal}
                            style={{marginRight: '10px', padding: '6px 12px'}}
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
