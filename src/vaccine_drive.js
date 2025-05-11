import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');
const BACKEND_URL = 'http://localhost:5000';

const VaccineDriveManagement = () => {
    const [drives, setDrives] = useState([]);
    const [loadingDrives, setLoadingDrives] = useState(true);
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

    const [dateSortOrder, setDateSortOrder] = useState('asc');

    useEffect(() => {
        refreshDrives();
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
            closeModal();
        }
    };

    const toggleDateSort = () => {
        setDateSortOrder(order => (order === 'asc' ? 'desc' : 'asc'));
    };

    const sortedDrives = [...drives].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateSortOrder === 'asc'
            ? dateA - dateB
            : dateB - dateA;
    });

    if (loadingDrives)
        return <div className="content"><p>Loading drives...</p></div>;
    if (errorDrives) return <div className="content"><p>Error: {errorDrives}</p></div>;

    return (
        <div className="content">
            <h1>Vaccine Drive Management</h1>
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
            {sortedDrives.length === 0 ? (
                <p>No drives found.</p>
            ) : (
                <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '900px' }}>
                    <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Sr No</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                        <th
                            style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left', cursor: 'pointer' }}
                            onClick={toggleDateSort}
                        >
                            Date {dateSortOrder === 'asc' ? '▲' : '▼'}
                        </th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Doses Available</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Applicable Classes</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Vaccine Name</th>
                        <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedDrives.map((drive, index) => (
                        <tr key={drive.id}>
                            <td style={{ padding: '8px' }}>{index + 1}</td>
                            <td style={{ padding: '8px' }}>{drive.id}</td>
                            <td style={{ padding: '8px' }}>{drive.name}</td>
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

export default VaccineDriveManagement;
