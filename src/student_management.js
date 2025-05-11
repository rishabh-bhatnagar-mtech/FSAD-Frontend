import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import CSVReader from 'react-csv-reader';
import './student_management.css';

const sampleCsvContent =
    'id,name,class,vaccine1,driveId1,vaccine2,driveId2\n' +
    'STU2001,Ananya,10th,Covishield,DRV001,Covaxin,DRV002\n' +
    'STU2002,Rahul,9th,Covishield,DRV001,,\n' +
    'STU2003,Meera,11th,Covaxin,DRV002,,\n' +
    'STU2004,Dev,10th,Sputnik,DRV003,,\n' +
    'STU2005,Simran,12th,,,\n';

Modal.setAppElement('#root');

const BACKEND_URL = 'http://localhost:5000'

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [vaccineTypes, setVaccineTypes] = useState([]);
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        class: '',
        vaccines: {},
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const res = await fetch(BACKEND_URL + '/drives');
                if (!res.ok) throw new Error('Failed to fetch drives');
                const data = await res.json();
                setDrives(data);
            } catch (err) {
                setDrives([]);
            }
        };

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await fetch(BACKEND_URL + '/students');
                if (!res.ok) throw new Error('Failed to fetch students');
                const data = await res.json();
                setStudents(data);
                const vaccinesSet = new Set();
                data.forEach(student => {
                    student.vaccines.forEach(v => vaccinesSet.add(v.name));
                });
                setVaccineTypes(Array.from(vaccinesSet).sort());
                setError(null);
            } catch (err) {
                setError(err.message);
                setStudents([]);
                setVaccineTypes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDrives();
        fetchStudents();
    }, []);

    const refreshStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(BACKEND_URL + '/students');
            if (!res.ok) throw new Error('Failed to fetch students');
            const data = await res.json();
            setStudents(data);
            const vaccinesSet = new Set();
            data.forEach(student => {
                student.vaccines.forEach(v => vaccinesSet.add(v.name));
            });
            setVaccineTypes(Array.from(vaccinesSet).sort());
            setError(null);
        } catch (err) {
            setError(err.message);
            setStudents([]);
            setVaccineTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setIsAddMode(true);
        const vaccinesObj = {};
        vaccineTypes.forEach(vaccine => {
            vaccinesObj[vaccine] = { hasVaccine: false, driveId: '' };
        });
        setFormData({
            id: '',
            name: '',
            class: '',
            vaccines: vaccinesObj,
        });
        setModalIsOpen(true);
    };

    const openModal = (student) => {
        setIsAddMode(false);
        setSelectedStudent(student);
        const vaccinesObj = {};
        vaccineTypes.forEach(vaccine => {
            const v = student.vaccines.find(vac => vac.name === vaccine);
            vaccinesObj[vaccine] = {
                hasVaccine: !!v,
                driveId: v ? v.driveId : '',
            };
        });
        setFormData({
            id: student.id,
            name: student.name,
            class: student.class,
            vaccines: vaccinesObj,
        });
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedStudent(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVaccineToggle = (vaccine) => {
        setFormData(prev => {
            const current = prev.vaccines[vaccine];
            return {
                ...prev,
                vaccines: {
                    ...prev.vaccines,
                    [vaccine]: {
                        hasVaccine: !current.hasVaccine,
                        driveId: !current.hasVaccine && drives.length > 0 ? drives[0].id : '',
                    },
                },
            };
        });
    };

    const handleDriveChange = (vaccine, driveId) => {
        setFormData(prev => ({
            ...prev,
            vaccines: {
                ...prev.vaccines,
                [vaccine]: {
                    ...prev.vaccines[vaccine],
                    driveId,
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentPayload = {
            id: formData.id,
            name: formData.name,
            class: formData.class,
            vaccines: Object.entries(formData.vaccines)
                .filter(([_, v]) => v.hasVaccine)
                .map(([name, v]) => ({ name, driveId: v.driveId })),
        };

        try {
            if (isAddMode) {
                const response = await fetch(BACKEND_URL + '/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([studentPayload]),
                });
                if (!response.ok) throw new Error('Failed to add student');
            } else {
                const response = await fetch(BACKEND_URL + `/students/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentPayload),
                });
                if (!response.ok) throw new Error('Failed to update student');
            }
            await refreshStudents();
            closeModal();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCSVImport = async (data) => {
        const importedStudents = data.map(row => {
            const { id, name, class: studentClass, ...rest } = row;
            const vaccines = [];
            Object.entries(rest).forEach(([key, value]) => {
                if (key.toLowerCase().startsWith('vaccine') && value) {
                    const num = key.replace(/[^0-9]/g, '');
                    const driveKey = `driveId${num}`;
                    vaccines.push({ name: value, driveId: row[driveKey] || '' });
                }
            });
            return { id, name, class: studentClass, vaccines };
        });

        try {
            const response = await fetch(BACKEND_URL + '/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importedStudents),
            });
            if (!response.ok) throw new Error('Failed to import students');
            await refreshStudents();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        const vaccinesStr = student.vaccines.map(v => v.name).join(' ').toLowerCase();
        return (
            student.name.toLowerCase().includes(query) ||
            student.class.toLowerCase().includes(query) ||
            student.id.toLowerCase().includes(query) ||
            vaccinesStr.includes(query)
        );
    });

    if (loading) return <div className="content"><p>Loading students...</p></div>;
    if (error) return <div className="content"><p>Error: {error}</p></div>;

    return (
        <div className="content">
            <h1>Student Management</h1>
            <div style={{ marginBottom: '16px' }}>
                <button className="action-button" onClick={openAddModal} style={{ marginRight: '16px' }}>
                    Add Student
                </button>
                <a
                    href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsvContent)}`}
                    download="students_sample.csv"
                    style={{ marginRight: '16px' }}
                >
                    Download Sample CSV
                </a>
                <CSVReader
                    cssClass="csv-reader-input"
                    label="Bulk Import Students (CSV): "
                    onFileLoaded={handleCSVImport}
                    parserOptions={{ header: true, skipEmptyLines: true }}
                    inputId="csvInput"
                    inputStyle={{ display: 'inline-block', marginLeft: '8px' }}
                />
            </div>
            <input
                type="text"
                placeholder="Search by name, class, ID, or vaccine"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ marginBottom: '16px', padding: '6px', width: '300px' }}
            />
            <table>
                <thead>
                <tr>
                    <th rowSpan="2">Sr No</th>
                    <th rowSpan="2">ID</th>
                    <th rowSpan="2">Name</th>
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
                {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                        <td>{idx + 1}</td>
                        <td>{student.id}</td>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        {vaccineTypes.map(vaccine => {
                            const hasVaccine = student.vaccines.some(v => v.name === vaccine);
                            return (
                                <td key={vaccine} aria-label={`${student.name} vaccinated with ${vaccine}`}>
                                    {hasVaccine ? 'Yes' : 'No'}
                                </td>
                            );
                        })}
                        <td>
                            <button className="action-button" onClick={() => openModal(student)}>
                                Edit
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel={isAddMode ? "Add Student" : "Edit Student Details"}
                style={{
                    content: {
                        maxWidth: '500px',
                        margin: 'auto',
                        inset: '40px',
                        padding: '20px',
                    },
                    overlay: {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                }}
            >
                <h2>{isAddMode ? "Add Student" : "Edit Student Details"}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            ID:
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    marginTop: '4px'
                                }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label>
                            Class:
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '6px', marginTop: '4px' }}
                                required
                            />
                        </label>
                    </div>
                    <fieldset style={{ marginBottom: '12px' }}>
                        <legend>Vaccines</legend>
                        {vaccineTypes.map(vaccine => {
                            const vaccineData = formData.vaccines[vaccine] || { hasVaccine: false, driveId: '' };
                            return (
                                <div key={vaccine} style={{ marginBottom: '8px' }}>
                                    <label style={{ marginRight: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={vaccineData.hasVaccine}
                                            onChange={() => handleVaccineToggle(vaccine)}
                                        />{' '}
                                        {vaccine}
                                    </label>
                                    {vaccineData.hasVaccine && (
                                        <select
                                            value={vaccineData.driveId}
                                            onChange={(e) => handleDriveChange(vaccine, e.target.value)}
                                            style={{ marginLeft: '10px', padding: '4px' }}
                                            required
                                        >
                                            <option value="" disabled>Select Drive</option>
                                            {drives.map(drive => (
                                                <option key={drive.id} value={drive.id}>{drive.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            );
                        })}
                    </fieldset>
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

export default StudentManagement;
