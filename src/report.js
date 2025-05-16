import React, {useEffect, useState} from 'react';
import {
    Button,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField
} from '@mui/material';
import * as XLSX from 'xlsx';
import './report.css';

const BACKEND_URL = 'http://localhost:5000';

function Report() {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [loading, setLoading] = useState(true);
    const [vaccineOptions, setVaccineOptions] = useState(['All']);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`${BACKEND_URL}/students`).then(res => res.json()),
            fetch(`${BACKEND_URL}/drives`).then(res => res.json())
        ])
            .then(([students, drives]) => {
                const driveMap = {};
                drives.forEach(drive => {
                    driveMap[drive.id] = drive;
                });
                let reportRows = [];
                students.forEach(student => {
                    if (student.vaccines && student.vaccines.length > 0) {
                        student.vaccines.forEach(vacc => {
                            const drive = driveMap[vacc.driveId] || {};
                            reportRows.push({
                                name: student.name,
                                class: student.class,
                                vaccinated: 'Yes',
                                date: drive.date || '-',
                                vaccine: vacc.name
                            });
                        });
                    } else {
                        reportRows.push({
                            name: student.name,
                            class: student.class,
                            vaccinated: 'No',
                            date: '-',
                            vaccine: '-'
                        });
                    }
                });
                if (filter !== 'All') {
                    reportRows = reportRows.filter(row => row.vaccine === filter);
                }
                setData(reportRows);
                const vaccines = Array.from(new Set(reportRows.map(row => row.vaccine).filter(v => v !== '-')));
                setVaccineOptions(['All', ...vaccines]);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [filter]);

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDownload = (type) => {
        const dataToExport = data.map(row => ({
            'Student Name': row.name,
            'Class': row.class,
            'Vaccinated Status': row.vaccinated,
            'Date of Vaccination': row.date,
            'Vaccine Name': row.vaccine,
        }));
        if (type === 'csv' || type === 'excel') {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Report');
            const fileType = type === 'csv' ? 'csv' : 'xlsx';
            const fileName = `Vaccination_Report.${fileType}`;
            XLSX.writeFile(wb, fileName, {bookType: fileType});
        }
    }

    return (
        <Paper className="report-container">
            <h2>Vaccination Report</h2>
            <TextField
                select
                label="Filter by Vaccine"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="report-filter"
            >
                {vaccineOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>
            {loading ? (
                <div className="report-loading">Loading...</div>
            ) : (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Vaccinated Status</TableCell>
                                    <TableCell>Date of Vaccination</TableCell>
                                    <TableCell>Vaccine Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.class}</TableCell>
                                            <TableCell>{row.vaccinated}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.vaccine}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={data.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <div className="report-downloads">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleDownload('csv')}
                            className="report-download-btn"
                        >
                            Download CSV
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleDownload('excel')}
                            className="report-download-btn"
                        >
                            Download Excel
                        </Button>
                    </div>
                </>
            )}
        </Paper>
    );
}

export default Report;
