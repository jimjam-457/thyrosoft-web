import React, { useState } from 'react';
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
  PersonAdd as AddPatientIcon
} from '@mui/icons-material';

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

const AddNew: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sample patient data
  const patients = [
    { id: 1, name: 'John Doe', age: 35, gender: 'Male', phone: '+1 234 567 890', email: 'john.doe@email.com' },
    { id: 2, name: 'Jane Smith', age: 28, gender: 'Female', phone: '+1 234 567 891', email: 'jane.smith@email.com' },
    { id: 3, name: 'Bob Johnson', age: 42, gender: 'Male', phone: '+1 234 567 892', email: 'bob.johnson@email.com' },
    { id: 4, name: 'Alice Brown', age: 31, gender: 'Female', phone: '+1 234 567 893', email: 'alice.brown@email.com' },
    { id: 5, name: 'Charlie Wilson', age: 39, gender: 'Male', phone: '+1 234 567 894', email: 'charlie.wilson@email.com' },
    { id: 6, name: 'Diana Davis', age: 26, gender: 'Female', phone: '+1 234 567 895', email: 'diana.davis@email.com' },
    { id: 7, name: 'Edward Miller', age: 45, gender: 'Male', phone: '+1 234 567 896', email: 'edward.miller@email.com' },
  ];

  // Sample doctor data
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology', clinicName: 'City Heart Center' },
    { id: 2, name: 'Dr. Michael Chen', specialization: 'Neurology', clinicName: 'Brain & Spine Institute' },
    { id: 3, name: 'Dr. Emily Davis', specialization: 'Dermatology', clinicName: 'Skin Care Clinic' },
    { id: 4, name: 'Dr. Robert Wilson', specialization: 'Orthopedics', clinicName: 'Joint & Bone Center' },
    { id: 5, name: 'Dr. Lisa Anderson', specialization: 'Gynecology', clinicName: 'Women\'s Health Center' },
    { id: 6, name: 'Dr. David Brown', specialization: 'Pediatrics', clinicName: 'Kids Care Clinic' },
    { id: 7, name: 'Dr. Jennifer Martinez', specialization: 'Ophthalmology', clinicName: 'Vision Care Center' },
  ];

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
              >
                Add Patient
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              <TableContainer sx={{ height: '100%', width: '100%' }}>
                <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '28%', fontSize: '0.875rem', py: 2, border: 'none' }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '8%', fontSize: '0.875rem', py: 2, border: 'none' }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Phone No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', width: '29%', fontSize: '0.875rem', py: 2, border: 'none' }}>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients
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
                          <TableCell sx={{ width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.id}</TableCell>
                          <TableCell sx={{ width: '28%', fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.name}</TableCell>
                          <TableCell sx={{ width: '8%', fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.age}</TableCell>
                          <TableCell sx={{ width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.gender}</TableCell>
                          <TableCell sx={{ width: '20%', fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.phone}</TableCell>
                          <TableCell sx={{ width: '29%', fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.email}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
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
            </Box>
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
