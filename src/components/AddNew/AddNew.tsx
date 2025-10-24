import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalHospital as DoctorsIcon,
  People as PatientsIcon,
  Business as BranchesIcon,
  Science as TestsIcon,
  BusinessCenter as B2BClientsIcon,
  AccountBalance as ExpensesIcon,
  Dashboard as DashboardIcon,
  AccountBalanceWallet as ExpendituresIcon,
  TrendingUp as SalesIcon,
  Assessment as ReportsIcon,
  Person as UsersIcon,
  ExitToApp as LogoutIcon,
  PersonAdd as AddPatientIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import PatientForm from '../PatientForm/PatientForm';
import axios from 'axios';
import { Alert, CircularProgress, Snackbar } from '@mui/material';

type AlertColor = 'success' | 'info' | 'warning' | 'error';

const drawerWidth = 180;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: 0,
  margin: 0,
  border: 'none',
  position: 'relative',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, id: 'dashboard' },
  { text: 'Doctors', icon: <DoctorsIcon />, id: 'doctors' },
  { text: 'Patients', icon: <PatientsIcon />, id: 'patients' },
  { text: 'Branches', icon: <BranchesIcon />, id: 'branches' },
  { text: 'Tests', icon: <TestsIcon />, id: 'tests' },
  { text: 'B2B Clients', icon: <B2BClientsIcon />, id: 'b2b-clients' },
  { text: 'Expenses Types', icon: <ExpensesIcon />, id: 'expenses-types' },
  { text: 'Expenditures', icon: <ExpendituresIcon />, id: 'expenditures' },
  { text: 'Sales', icon: <SalesIcon />, id: 'sales' },
  { text: 'Reports', icon: <ReportsIcon />, id: 'reports' },
  { text: 'Users', icon: <UsersIcon />, id: 'users' },
  { text: 'Logout', icon: <LogoutIcon />, id: 'logout' },
];

// API base URL
const API_URL = 'http://localhost:3771/api';

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  clinicName: string;
}

interface Patient {
  id?: number;
  patient_id: string;
  name: string;
  age?: number;
  gender?: string;
  contact_number: string;
  test_type: string;
  email?: string;
  address?: string;
  barcode_number?: string;
  doctor_referred?: string;
  branch?: string;
  price?: number;
  date?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const AddNew: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sample doctor data
  const doctors: Doctor[] = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology', clinicName: 'City Heart Center' },
    { id: 2, name: 'Dr. Michael Chen', specialization: 'Neurology', clinicName: 'Brain & Spine Institute' },
    { id: 3, name: 'Dr. Emily Davis', specialization: 'Dermatology', clinicName: 'Skin Care Clinic' },
    { id: 4, name: 'Dr. Robert Wilson', specialization: 'Orthopedics', clinicName: 'Joint & Bone Center' },
    { id: 5, name: 'Dr. Lisa Anderson', specialization: 'Gynecology', clinicName: 'Women\'s Health Center' },
    { id: 6, name: 'Dr. David Brown', specialization: 'Pediatrics', clinicName: 'Kids Care Clinic' },
    { id: 7, name: 'Dr. Jennifer Martinez', specialization: 'Ophthalmology', clinicName: 'Vision Care Center' },
  ];

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/patients');
      setPatients(response.data as Patient[]);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
      showSnackbar('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load patients when component mounts and when selectedItem changes to 'patients'
  useEffect(() => {
    if (selectedItem === 'patients') {
      fetchPatients();
    }
  }, [selectedItem]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleListItemClick = (itemId: string) => {
    if (itemId === 'logout') {
      // Handle logout functionality
      window.location.href = '/login';
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleOpenForm = (patient: Patient | null = null) => {
    setCurrentPatient(patient);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentPatient(null);
  };

  const handleSavePatient = async (patientData: any) => {
    setIsSaving(true);
    try {
      if (currentPatient) {
        // Update existing patient
        await api.put(`/patients/${currentPatient.id}`, patientData);
        showSnackbar('Patient updated successfully', 'success');
      } else {
        // Add new patient
        await api.post('/patients', patientData);
        showSnackbar('Patient added successfully', 'success');
      }
      fetchPatients(); // Refresh the list
      handleCloseForm();
    } catch (err: any) {
      console.error('Error saving patient:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save patient';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        showSnackbar('Patient deleted successfully', 'success');
        fetchPatients(); // Refresh the list
      } catch (err) {
        console.error('Error deleting patient:', err);
        showSnackbar('Failed to delete patient', 'error');
      }
    }
  };

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome to the Dashboard. Select an item from the sidebar to view details.
            </Typography>
          </Box>
        );
      case 'doctors':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Doctors Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DoctorsIcon />}
                size="large"
              >
                Add Doctor
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              <TableContainer sx={{ height: '100%', width: '100%' }}>
                <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '35%', fontSize: '0.875rem', py: 2, border: 'none' }}>Doctor Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '30%', fontSize: '0.875rem', py: 2, border: 'none' }}>Specialization</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '30%', fontSize: '0.875rem', py: 2, border: 'none' }}>Clinic Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doctors
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((doctor) => (
                        <TableRow
                          key={doctor.id}
                          hover
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f5f5f5',
                            },
                            border: 'none'
                          }}
                        >
                          <TableCell sx={{ width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.id}</TableCell>
                          <TableCell sx={{ width: '35%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.name}</TableCell>
                          <TableCell sx={{ width: '30%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.specialization}</TableCell>
                          <TableCell sx={{ width: '30%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.clinicName}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={doctors.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  backgroundColor: '#fff',
                  borderTop: '1px solid #e0e0e0',
                  border: 'none',
                  mt: 0
                }}
              />
            </Box>
          </Box>
        );
      case 'patients':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Patients Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddPatientIcon />}
                size="large"
                onClick={() => handleOpenForm()}
              >
                Add Patient
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box p={3} textAlign="center">
                  <Typography color="error">{error}</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={fetchPatients}
                    sx={{ mt: 2 }}
                  >
                    Retry
                  </Button>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ height: '100%', width: '100%' }}>
                    <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Patient Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>Patient ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '8%', fontSize: '0.875rem', py: 2, border: 'none' }}>Age</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>Gender</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '15%', fontSize: '0.8rem', py: 2, border: 'none' }}>Contact</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.8rem', py: 2, border: 'none' }}>Test Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '12%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="textSecondary">
                                No patients found. Click 'Add Patient' to create a new record.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          patients
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((patient) => (
                              <TableRow
                                key={patient.id}
                                hover
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  border: 'none'
                                }}
                              >
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.id}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.name}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.patient_id}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.age}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.gender}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.contact_number}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.test_type}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                  <Box display="flex" gap={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<EditIcon fontSize="small" />}
                                      onClick={() => handleOpenForm(patient)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon fontSize="small" />}
                                      onClick={() => handleDeletePatient(patient.id!)}
                                    >
                                      Delete
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={patients.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      backgroundColor: '#fff',
                      borderTop: '1px solid #e0e0e0',
                      border: 'none',
                      mt: 0
                    }}
                  />
                </>
              )}
            </Box>

            {/* Patient Form Dialog */}
            <PatientForm
              open={isFormOpen}
              onClose={handleCloseForm}
              patient={currentPatient}
              onSave={handleSavePatient}
              isSaving={isSaving}
            />

            {/* Snackbar for notifications */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        );
      case 'branches':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Branches Management
            </Typography>
            <Typography variant="body1">
              Manage different branch locations, staff, and operations.
            </Typography>
          </Box>
        );
      case 'tests':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Tests Management
            </Typography>
            <Typography variant="body1">
              Manage laboratory tests, results, and test categories.
            </Typography>
          </Box>
        );
      case 'b2b-clients':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              B2B Clients Management
            </Typography>
            <Typography variant="body1">
              Manage business-to-business client relationships and contracts.
            </Typography>
          </Box>
        );
      case 'expenses-types':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Expenses Types Management
            </Typography>
            <Typography variant="body1">
              Define and manage different types of business expenses.
            </Typography>
          </Box>
        );
      case 'expenditures':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Expenditures Management
            </Typography>
            <Typography variant="body1">
              Track and manage all business expenditures and financial records.
            </Typography>
          </Box>
        );
      case 'sales':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Sales Management
            </Typography>
            <Typography variant="body1">
              Monitor sales performance, revenue, and customer transactions.
            </Typography>
          </Box>
        );
      case 'reports':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1">
              Generate comprehensive reports and analyze business performance.
            </Typography>
          </Box>
        );
      case 'users':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Users Management
            </Typography>
            <Typography variant="body1">
              Manage system users, roles, permissions, and access control.
            </Typography>
          </Box>
        );
      case 'logout':
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Logging Out...
            </Typography>
            <Typography variant="body1">
              You are being redirected to the login page.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body1">
              Select an item from the sidebar to get started.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', m: 0, p: 0 }}>
      <StyledDrawer
        variant="permanent"
        open
        sx={{
          '& .MuiDrawer-paper': {
            position: 'relative',
            height: '100vh',
            border: 'none',
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Toolbar sx={{ minHeight: '64px', px: 2 }} />
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <StyledListItemButton
                  selected={selectedItem === item.id}
                  onClick={() => handleListItemClick(item.id)}
                  sx={{
                    minHeight: '48px',
                    px: 2,
                    py: 1
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: selectedItem === item.id ? 600 : 400
                    }}
                  />
                </StyledListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </StyledDrawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          m: 0,
          backgroundColor: '#f5f5f5',
          overflow: 'auto',
          border: 'none',
          position: 'relative'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 0,
            m: 0,
            minHeight: '100vh',
            backgroundColor: '#fff',
            width: '100%',
            maxWidth: '100%',
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none'
          }}
        >
          {renderContent()}
        </Paper>
      </Box>
    </Box>
  );
};

export default AddNew;
