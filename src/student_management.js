import React, {useEffect, useState} from 'react';
import Modal from 'react-modal';
import './student_management.css';

const stubbedStudentsResponse = [
    {
        id: 'STU1001',
        name: 'Aarav',
        class: '10th',
        vaccines: [
            {name: 'Covishield', driveId: 'DRV001'},
            {name: 'Covaxin', driveId: 'DRV002'},
        ],
    },
    {
        id: 'STU1002',
        name: 'Isha',
        class: '12th',
        vaccines: [{name: 'Covishield', driveId: 'DRV001'}],
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
        vaccines: [{name: 'Covaxin', driveId: 'DRV002'}],
    },
    {
        id: 'STU1005',
        name: 'Karan',
        class: '10th',
        vaccines: [
            {name: 'Covishield', driveId: 'DRV001'},
            {name: 'Sputnik', driveId: 'DRV003'},
        ],
    },
];

const stubbedDrives = [
    {id: 'DRV001', name: 'Drive A'},
    {id: 'DRV002', name: 'Drive B'},
    {id: 'DRV003', name: 'Drive C'},
];

const fetchStubbedStudents = () =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(stubbedStudentsResponse);
        }, 1000);
    });

Modal.setAppElement('#root');

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [vaccineTypes, setVaccineTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        class: '',
        vaccines: {}, // { vaccineName: { hasVaccine: bool, driveId: string } }
    });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await fetchStubbedStudents();
                setStudents(data);

                const vaccinesSet = new Set();
                data.forEach(student => {
                    student.vaccines.forEach(v => vaccinesSet.add(v.name));
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

    const openModal = (student) => {
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
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
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
                        driveId: !current.hasVaccine ? stubbedDrives[0].id : '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        closeModal();
    };

    if (loading) return <div className="content"><p>Loading students...</p></div>;
    if (error) return <div className="content"><p>Error: {error}</p></div>;

    return (
        <div className="content">
            <h1>Student Management</h1>
            <table>
                <thead>
                <tr>
                    <th rowSpan="2">Sr No</th>
                    <th rowSpan="2">ID</th>
                    <th rowSpan="2">Name</th>
                    <th rowSpan="2">Class</th>
                    <th colSpan={vaccineTypes.length} style={{textAlign: 'center'}}>Vaccines</th>
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
                contentLabel="Edit Student Details"
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
                <h2>Edit Student Details</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                required
                            />
                        </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            ID:
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    marginTop: '4px',
                                    backgroundColor: '#eee',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </label>
                    </div>
                    <div style={{marginBottom: '12px'}}>
                        <label>
                            Class:
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleInputChange}
                                style={{width: '100%', padding: '6px', marginTop: '4px'}}
                                required
                            />
                        </label>
                    </div>
                    <fieldset style={{marginBottom: '12px'}}>
                        <legend>Vaccines</legend>
                        {vaccineTypes.map(vaccine => {
                            const vaccineData = formData.vaccines[vaccine] || {hasVaccine: false, driveId: ''};
                            return (
                                <div key={vaccine} style={{marginBottom: '8px'}}>
                                    <label style={{marginRight: '10px'}}>
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
                                            style={{marginLeft: '10px', padding: '4px'}}
                                            required
                                        >
                                            <option value="" disabled>Select Drive</option>
                                            {stubbedDrives.map(drive => (
                                                <option key={drive.id} value={drive.id}>{drive.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            );
                        })}
                    </fieldset>
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

export default StudentManagement;
