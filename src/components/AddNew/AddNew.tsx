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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Card,
  CardContent,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  AppBar,
  useTheme,
  useMediaQuery
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
  Delete as DeleteIcon,
  Print as PrintIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import PatientForm from '../PatientForm/PatientForm';
import BranchForm from '../BranchForm/BranchForm';
import DoctorForm from '../DoctorForm/DoctorForm';
import UserForm from '../UserForm/UserForm';
import TestForm from '../TestForm/TestForm';
import TestPackageForm from '../TestPackageForm/TestPackageForm';
import B2BClientForm from '../B2BClientForm/B2BClientForm';
import SalesForm, { SalesRecordInput } from '../SalesForm/SalesForm';
import axios from 'axios';
import { API_URL } from '../../config';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import SalesReceipt from '../SalesReceipt/SalesReceipt';
import Reports from '../Reports/Reports';

type AlertColor = 'success' | 'info' | 'warning' | 'error';

const drawerWidth = 180;

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
  { text: 'Test Packages', icon: <TestsIcon />, id: 'testpackages' },
  { text: 'B2B Clients', icon: <B2BClientsIcon />, id: 'b2b-clients' },
  { text: 'Expenses Types', icon: <ExpensesIcon />, id: 'expenses-types' },
  { text: 'Expenditures', icon: <ExpendituresIcon />, id: 'expenditures' },
  { text: 'Sales', icon: <SalesIcon />, id: 'sales' },
  { text: 'Reports', icon: <ReportsIcon />, id: 'reports' },
  { text: 'Users', icon: <UsersIcon />, id: 'users' },
  { text: 'Logout', icon: <LogoutIcon />, id: 'logout' },
];

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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

interface SalesRecord {
  id?: number;
  invoice_no: string;
  client: string; // B2C or B2B
  institution?: string | null; // for B2B
  ref_by_doctor?: string | null;
  patient_name?: string | null;
  patient_id?: string | null;
  total?: number;
  advance: number;
  balance_due?: number;
  status: 'Pending' | 'Done' | 'Cancelled' | string;
  date: string; // ISO date
}

interface B2BClient {
  id?: number;
  institution_name: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
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

interface Doctor {
  id?: number;
  name: string;
  specialization: string;
  clinicName: string;
  phone_number?: string;
  created_at?: string;
}

interface Branch {
  id?: number;
  branch_code: string;
  branch_name: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
}

interface User {
  id?: number;
  name: string;
  phone_number: string;
  email: string;
  password?: string;
  created_at?: string;
}

interface Test {
  id?: number;
  testname: string;
  cost_b2c: number;
  cost_b2b: number;
  created_at?: string;
}

interface TestPackage {
  id?: number;
  testpackage_name: string;
  no_of_tests: number;
  list_of_tests: string;
  cost_b2c: number;
  cost_b2b: number;
  created_at?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const AddNew: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(false);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [isDoctorFormOpen, setIsDoctorFormOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isDoctorSaving, setIsDoctorSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isBranchSaving, setIsBranchSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserSaving, setIsUserSaving] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [testsLoading, setTestsLoading] = useState<boolean>(false);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [isTestFormOpen, setIsTestFormOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [isTestSaving, setIsTestSaving] = useState(false);
  const [testPackages, setTestPackages] = useState<TestPackage[]>([]);
  const [testPackagesLoading, setTestPackagesLoading] = useState<boolean>(false);
  const [testPackagesError, setTestPackagesError] = useState<string | null>(null);
  const [isTestPackageFormOpen, setIsTestPackageFormOpen] = useState(false);
  const [currentTestPackage, setCurrentTestPackage] = useState<TestPackage | null>(null);
  const [isTestPackageSaving, setIsTestPackageSaving] = useState(false);

  const [b2bClients, setB2bClients] = useState<B2BClient[]>([]);
  const [b2bLoading, setB2bLoading] = useState<boolean>(false);
  const [b2bError, setB2bError] = useState<string | null>(null);
  const [isB2bFormOpen, setIsB2bFormOpen] = useState(false);
  const [currentB2bClient, setCurrentB2bClient] = useState<B2BClient | null>(null);
  const [isB2bSaving, setIsB2bSaving] = useState(false);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [salesLoading, setSalesLoading] = useState<boolean>(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptSaleId, setReceiptSaleId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [statsDate, setStatsDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Utility functions
  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleOpenReceipt = (sale: SalesRecord) => {
    if (!sale.id) return;
    setReceiptSaleId(sale.id);
    setIsReceiptOpen(true);
  };
  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setReceiptSaleId(null);
  };

  const handleOpenSalesForm = () => setIsSalesFormOpen(true);
  const handleCloseSalesForm = () => { setIsSalesFormOpen(false); setEditingSale(null); };
  const handleSaveSale = (record: SalesRecordInput & { total: number; balance_due: number }) => {
    // Create a lightweight row for table view; invoice_no could be generated by backend later
    const row: SalesRecord = {
      // id intentionally omitted for optimistic row to avoid actions on unsynced sale
      invoice_no: `TC${String(Date.now()).slice(-7)}`,
      client: record.client_type,
      institution: record.client_type === 'B2B' ? (record.b2b_client_name || '—') : '—',
      ref_by_doctor: record.ref_by_doctor_name || '—',
      patient_name: record.patient_name || '—',
      patient_id: record.patient_id ? String(record.patient_id) : '—',
      total: Number(record.total || 0),
      advance: Number(record.advance || 0),
      balance_due: Number(record.balance_due || 0),
      status: record.status,
      date: record.date,
    };
    setSales(prev => [row, ...prev]);
    setSalesError(null);
    showSnackbar('Sale added', 'success');
    handleCloseSalesForm();
    fetchSales();
  };

  const handleEditSale = (sale: SalesRecord) => {
    setEditingSale(sale);
    setIsSalesFormOpen(true);
  };

  const handleUpdateSale = (id: number, record: SalesRecordInput & { total: number; balance_due: number }) => {
    setSales(prev => prev.map(s => s.id === id ? {
      ...s,
      client: record.client_type,
      institution: record.client_type === 'B2B' ? (record.b2b_client_name || '—') : '—',
      ref_by_doctor: record.ref_by_doctor_name || '—',
      patient_name: record.patient_name || '—',
      patient_id: record.patient_id ? String(record.patient_id) : '—',
      total: Number(record.total || 0),
      advance: Number(record.advance || 0),
      balance_due: Number(record.balance_due || 0),
      status: record.status,
      date: record.date,
    } : s));
    showSnackbar('Sale updated', 'success');
    handleCloseSalesForm();
  };

  const handleDeleteSale = async (sale: SalesRecord) => {
    if (!sale.id) {
      showSnackbar('Cannot delete unsynced sale. Please refresh.', 'warning');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    try {
      await api.delete(`/sales/${sale.id}`);
      showSnackbar('Sale deleted', 'success');
      fetchSales();
    } catch (err) {
      console.error('Error deleting sale:', err);
      showSnackbar('Failed to delete sale', 'error');
    }
  };

  // Fetch sales from API
  const fetchSales = async () => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      const response = await api.get('/sales');
      const rows = (response.data as any[]) || [];
      const mapped: SalesRecord[] = rows.map((r: any) => ({
        id: r.id,
        invoice_no: r.invoice_no,
        client: r.client_type,
        institution: r.institution_name || '—',
        ref_by_doctor: r.doctor_name || '—',
        patient_name: r.patient_name || '—',
        patient_id: r.patient_id ? String(r.patient_id) : '—',
        total: Number(r.total || 0),
        advance: Number(r.advance || 0),
        balance_due: Number(r.balance_due || 0),
        status: r.status,
        date: r.date,
      }));
      setSales(mapped);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setSalesError('Failed to load sales. Backend endpoint not ready yet.');
    } finally {
      setSalesLoading(false);
    }
  };

  // Fetch B2B clients from API
  const fetchB2bClients = async () => {
    setB2bLoading(true);
    setB2bError(null);
    try {
      const response = await api.get('/b2b-clients');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setB2bClients(arr as B2BClient[]);
    } catch (err: any) {
      console.error('Error fetching B2B clients:', err);
      setB2bError('Failed to load clients. Please try again later.');
      showSnackbar('Failed to load clients', 'error');
    } finally {
      setB2bLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev: SnackbarState) => ({ ...prev, open: false }));
  };

  const fetchStats = async (period: 'day' | 'week' | 'month', dateStr: string) => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await api.get(`/stats/summary`, { params: { period, date: dateStr } });
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setStatsError('Failed to load stats.');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/patients');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setPatients(arr as Patient[]);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again later.');
      showSnackbar('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors from API
  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    try {
      const response = await api.get('/doctors');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setDoctors(arr as Doctor[]);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      setDoctorsError('Failed to load doctors. Please try again later.');
      showSnackbar('Failed to load doctors', 'error');
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Fetch branches from API
  const fetchBranches = async () => {
    setBranchesLoading(true);
    setBranchesError(null);
    try {
      const response = await api.get('/branches');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setBranches(arr as Branch[]);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
      setBranchesError('Failed to load branches. Please try again later.');
      showSnackbar('Failed to load branches', 'error');
    } finally {
      setBranchesLoading(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await api.get('/users');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setUsers(arr as User[]);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError('Failed to load users. Please try again later.');
      showSnackbar('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch tests from API
  const fetchTests = async () => {
    setTestsLoading(true);
    setTestsError(null);
    try {
      const response = await api.get('/tests');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setTests(arr as Test[]);
    } catch (err: any) {
      console.error('Error fetching tests:', err);
      setTestsError('Failed to load tests. Please try again later.');
      showSnackbar('Failed to load tests', 'error');
    } finally {
      setTestsLoading(false);
    }
  };

  // Fetch test packages from API
  const fetchTestPackages = async () => {
    setTestPackagesLoading(true);
    setTestPackagesError(null);
    try {
      const response = await api.get('/testpackages');
      const data: any = response?.data;
      const arr = Array.isArray(data)
        ? data
        : (Array.isArray(data?.items) ? data.items : []);
      setTestPackages(arr as TestPackage[]);
    } catch (err: any) {
      console.error('Error fetching test packages:', err);
      setTestPackagesError('Failed to load test packages. Please try again later.');
      showSnackbar('Failed to load test packages', 'error');
    } finally {
      setTestPackagesLoading(false);
    }
  };

  // Load data when component mounts and when selectedItem changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedItem === 'doctors') {
      fetchDoctors();
    } else if (selectedItem === 'patients') {
      fetchPatients();
    } else if (selectedItem === 'branches') {
      fetchBranches();
    } else if (selectedItem === 'users') {
      fetchUsers();
    } else if (selectedItem === 'tests') {
      fetchTests();
    } else if (selectedItem === 'testpackages') {
      fetchTestPackages();
    } else if (selectedItem === 'b2b-clients') {
      fetchB2bClients();
    } else if (selectedItem === 'sales') {
      if (!isSalesFormOpen) {
        fetchSales();
      }
    }
  }, [selectedItem]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedItem === 'dashboard') {
      fetchStats(statsPeriod, statsDate);
    }
  }, [statsPeriod, statsDate, selectedItem]);

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

  // Doctor handlers
  const handleOpenDoctorForm = (doctor: Doctor | null = null) => {
    setCurrentDoctor(doctor);
    setIsDoctorFormOpen(true);
  };

  const handleCloseDoctorForm = () => {
    setIsDoctorFormOpen(false);
    setCurrentDoctor(null);
  };

  const handleSaveDoctor = async (doctorData: Doctor) => {
    setIsDoctorSaving(true);
    try {
      if (currentDoctor) {
        // Update existing doctor
        await api.put(`/doctors/${currentDoctor.id}`, doctorData);
        showSnackbar('Doctor updated successfully', 'success');
      } else {
        // Add new doctor
        await api.post('/doctors', doctorData);
        showSnackbar('Doctor added successfully', 'success');
      }
      fetchDoctors(); // Refresh the list
      handleCloseDoctorForm();
    } catch (err: any) {
      console.error('Error saving doctor:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save doctor';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsDoctorSaving(false);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        showSnackbar('Doctor deleted successfully', 'success');
        fetchDoctors(); // Refresh the list
      } catch (err) {
        console.error('Error deleting doctor:', err);
        showSnackbar('Failed to delete doctor', 'error');
      }
    }
  };

  // Branch handlers
  const handleOpenBranchForm = (branch: Branch | null = null) => {
    setCurrentBranch(branch);
    setIsBranchFormOpen(true);
  };

  const handleCloseBranchForm = () => {
    setIsBranchFormOpen(false);
    setCurrentBranch(null);
  };

  const handleSaveBranch = async (branchData: Branch) => {
    setIsBranchSaving(true);
    try {
      if (currentBranch) {
        // Update existing branch
        await api.put(`/branches/${currentBranch.id}`, branchData);
        showSnackbar('Branch updated successfully', 'success');
      } else {
        // Add new branch
        await api.post('/branches', branchData);
        showSnackbar('Branch added successfully', 'success');
      }
      fetchBranches(); // Refresh the list
      handleCloseBranchForm();
    } catch (err: any) {
      console.error('Error saving branch:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save branch';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsBranchSaving(false);
    }
  };

  const handleDeleteBranch = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/branches/${id}`);
        showSnackbar('Branch deleted successfully', 'success');
        fetchBranches(); // Refresh the list
      } catch (err) {
        console.error('Error deleting branch:', err);
        showSnackbar('Failed to delete branch', 'error');
      }
    }
  };

  // User handlers
  const handleOpenUserForm = (user: User | null = null) => {
    setCurrentUser(user);
    setIsUserFormOpen(true);
  };

  const handleCloseUserForm = () => {
    setIsUserFormOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = async (userData: User) => {
    setIsUserSaving(true);
    try {
      if (currentUser) {
        // Update existing user
        await api.put(`/users/${currentUser.id}`, userData);
        showSnackbar('User updated successfully', 'success');
      } else {
        // Add new user
        await api.post('/users', userData);
        showSnackbar('User added successfully', 'success');
      }
      fetchUsers(); // Refresh the list
      handleCloseUserForm();
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsUserSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        showSnackbar('User deleted successfully', 'success');
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error('Error deleting user:', err);
        showSnackbar('Failed to delete user', 'error');
      }
    }
  };

  // Test handlers
  const handleOpenTestForm = (test: Test | null = null) => {
    setCurrentTest(test);
    setIsTestFormOpen(true);
  };

  const handleCloseTestForm = () => {
    setIsTestFormOpen(false);
    setCurrentTest(null);
  };

  const handleSaveTest = async (testData: Test) => {
    setIsTestSaving(true);
    try {
      if (currentTest) {
        // Update existing test
        await api.put(`/tests/${currentTest.id}`, testData);
        showSnackbar('Test updated successfully', 'success');
      } else {
        // Add new test
        await api.post('/tests', testData);
        showSnackbar('Test added successfully', 'success');
      }
      fetchTests(); // Refresh the list
      handleCloseTestForm();
    } catch (err: any) {
      console.error('Error saving test:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save test';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsTestSaving(false);
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.delete(`/tests/${id}`);
        showSnackbar('Test deleted successfully', 'success');
        fetchTests(); // Refresh the list
      } catch (err) {
        console.error('Error deleting test:', err);
        showSnackbar('Failed to delete test', 'error');
      }
    }
  };

  // Test Package handlers
  const handleOpenTestPackageForm = (testPackage: TestPackage | null = null) => {
    setCurrentTestPackage(testPackage);
    setIsTestPackageFormOpen(true);
  };

  const handleCloseTestPackageForm = () => {
    setIsTestPackageFormOpen(false);
    setCurrentTestPackage(null);
  };

  const handleSaveTestPackage = async (testPackageData: TestPackage) => {
    setIsTestPackageSaving(true);
    try {
      if (currentTestPackage) {
        // Update existing test package
        await api.put(`/testpackages/${currentTestPackage.id}`, testPackageData);
        showSnackbar('Test package updated successfully', 'success');
      } else {
        // Add new test package
        await api.post('/testpackages', testPackageData);
        showSnackbar('Test package added successfully', 'success');
      }
      fetchTestPackages(); // Refresh the list
      handleCloseTestPackageForm();
    } catch (err: any) {
      console.error('Error saving test package:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save test package';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsTestPackageSaving(false);
    }
  };

  const handleDeleteTestPackage = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this test package?')) {
      try {
        await api.delete(`/testpackages/${id}`);
        showSnackbar('Test package deleted successfully', 'success');
        fetchTestPackages(); // Refresh the list
      } catch (err) {
        console.error('Error deleting test package:', err);
        showSnackbar('Failed to delete test package', 'error');
      }
    }
  };

  // B2B Client handlers
  const handleOpenB2bForm = (client: B2BClient | null = null) => {
    setCurrentB2bClient(client);
    setIsB2bFormOpen(true);
  };

  const handleCloseB2bForm = () => {
    setIsB2bFormOpen(false);
    setCurrentB2bClient(null);
  };

  const handleSaveB2bClient = async (clientData: B2BClient) => {
    setIsB2bSaving(true);
    try {
      if (currentB2bClient) {
        await api.put(`/b2b-clients/${currentB2bClient.id}`, clientData);
        showSnackbar('Client updated successfully', 'success');
      } else {
        await api.post('/b2b-clients', clientData);
        showSnackbar('Client added successfully', 'success');
      }
      fetchB2bClients();
      handleCloseB2bForm();
    } catch (err: any) {
      console.error('Error saving client:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to save client';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsB2bSaving(false);
    }
  };

  const handleDeleteB2bClient = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/b2b-clients/${id}`);
        showSnackbar('Client deleted successfully', 'success');
        fetchB2bClients();
      } catch (err) {
        console.error('Error deleting client:', err);
        showSnackbar('Failed to delete client', 'error');
      }
    }
  };

  const renderContent = () => {
    switch (selectedItem) {
      case 'dashboard':
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5">Dashboard</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                  size="small"
                  value={statsPeriod}
                  exclusive
                  onChange={(e, val) => { if (val) setStatsPeriod(val); }}
                >
                  <ToggleButton value="day">Per Day</ToggleButton>
                  <ToggleButton value="week">Per Week</ToggleButton>
                  <ToggleButton value="month">Per Month</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  type="date"
                  size="small"
                  value={statsDate}
                  onChange={(e) => setStatsDate(e.target.value)}
                />
              </Box>
            </Box>
            {statsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : statsError ? (
              <Typography color="error">{statsError}</Typography>
            ) : (
              <Box sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)'
                }
              }}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Sales Count</Typography>
                    <Typography variant="h5">{stats?.sales_count ?? 0}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Amount Credited</Typography>
                    <Typography variant="h5">₹{Number(stats?.amount_credited || 0).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Amount Balance</Typography>
                    <Typography variant="h5">₹{Number(stats?.amount_balance || 0).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h5">₹{Number(stats?.amount_total || 0).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Doctor Referrals</Typography>
                    <Typography variant="h5">{stats?.doctor_referrals_count ?? 0}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">B2B Sales</Typography>
                    <Typography variant="h5">{stats?.b2b_sales_count ?? 0}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">B2C Sales</Typography>
                    <Typography variant="h5">{stats?.b2c_sales_count ?? 0}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">B2B Clients (Distinct)</Typography>
                    <Typography variant="h5">{stats?.b2b_clients_count_distinct ?? 0}</Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        );
      case 'doctors':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: { xs: 2, md: 3 }, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant={isMobile ? "h6" : "h5"}>
                Doctors Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={!isMobile && <DoctorsIcon />}
                size={isMobile ? "medium" : "large"}
                onClick={() => handleOpenDoctorForm()}
              >
                {isMobile ? "Add" : "Add Doctor"}
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {/* Mobile Card View */}
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {doctorsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : doctorsError ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="error">{doctorsError}</Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={fetchDoctors}
                        sx={{ mt: 2 }}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : !Array.isArray(doctors) || doctors.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No doctors found. Click 'Add' to create a new doctor.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {(Array.isArray(doctors) ? doctors : [])
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((doctor) => (
                          <Card key={doctor.id} sx={{ mb: 2, boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.5 }}>
                                    {doctor.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    <strong>ID:</strong> {doctor.id}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Specialization:</strong> {doctor.specialization}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  <strong>Clinic:</strong> {doctor.clinicName}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Phone:</strong> {doctor.phone_number}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDoctorForm(doctor)}
                                  sx={{ border: '1px solid', borderColor: 'primary.main' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteDoctor(doctor.id!)}
                                  sx={{ border: '1px solid', borderColor: 'error.main' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      
                      <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={Array.isArray(doctors) ? doctors.length : 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ backgroundColor: '#fff', mt: 2 }}
                      />
                    </>
                  )}
                </Box>
              ) : (
                /* Desktop Table View */
                <>
                  <TableContainer sx={{ height: '100%', width: '100%' }}>
                    <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Doctor Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Specialization</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Clinic Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '15%', fontSize: '0.875rem', py: 2, border: 'none' }}>Phone Number</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {doctorsLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <CircularProgress />
                            </TableCell>
                          </TableRow>
                        ) : doctorsError ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <Typography color="error">{doctorsError}</Typography>
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={fetchDoctors}
                                sx={{ mt: 2 }}
                              >
                                Retry
                              </Button>
                            </TableCell>
                          </TableRow>
                        ) : !Array.isArray(doctors) || doctors.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="textSecondary">
                                No doctors found. Click 'Add Doctor' to create a new doctor.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (Array.isArray(doctors) ? doctors : [])
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
                                <TableCell sx={{ width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.name}</TableCell>
                                <TableCell sx={{ width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.specialization}</TableCell>
                                <TableCell sx={{ width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>{doctor.clinicName}</TableCell>
                                <TableCell sx={{ width: '15%', fontSize: '0.8rem', py: 2, border: 'none' }}>{doctor.phone_number}</TableCell>
                                <TableCell sx={{ width: '5%', fontSize: '0.8rem', py: 1, border: 'none' }}>
                                  <Box display="flex" gap={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<EditIcon fontSize="small" />}
                                      onClick={() => handleOpenDoctorForm(doctor)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon fontSize="small" />}
                                      onClick={() => handleDeleteDoctor(doctor.id!)}
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
                    count={Array.isArray(doctors) ? doctors.length : 0}
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

            {/* Doctor Form Dialog */}
            <DoctorForm
              open={isDoctorFormOpen}
              onClose={handleCloseDoctorForm}
              doctor={currentDoctor}
              onSave={handleSaveDoctor}
              isSaving={isDoctorSaving}
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
              {isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 2 }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{error}</Typography>
                      <Button variant="outlined" onClick={fetchPatients} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : patients.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        No patients found. Click 'Add Patient' to create a new record.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {patients
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((patient) => (
                            <Card key={patient.id} sx={{ boxShadow: 2 }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                      {patient.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">PID: {patient.patient_id}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenForm(patient)}
                                      sx={{ color: '#1976d2', width: 40, height: 40 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeletePatient(patient.id!)}
                                      sx={{ color: '#d32f2f', width: 40, height: 40 }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Age / Gender</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{patient.age} / {patient.gender}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary" display="block">Contact</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{patient.contact_number || 'N/A'}</Typography>
                                  </Box>
                                  <Box sx={{ gridColumn: '1 / -1' }}>
                                    <Typography variant="caption" color="textSecondary" display="block">Test Type</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{patient.test_type || 'N/A'}</Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                      </Box>
                      <TablePagination
                        component="div"
                        count={patients.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50]}
                        sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }}
                      />
                    </>
                  )}
                </Box>
              ) : (
                /* Desktop Table View */
                <>
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : error ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{error}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchPatients} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                      <TableContainer sx={{ height: '100%', width: '100%' }}>
                        <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
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
                                  <TableRow key={patient.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                                    <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.id}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.name}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.patient_id}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.age}</TableCell>
                                    <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{patient.gender}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.contact_number}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{patient.test_type}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                      <Box display="flex" gap={1}>
                                        <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenForm(patient)}>Edit</Button>
                                        <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => handleDeletePatient(patient.id!)}>Delete</Button>
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
                        sx={{ backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', border: 'none', mt: 0 }}
                      />
                    </>
                  )}
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
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Branches Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<BranchesIcon />}
                size="large"
                onClick={() => handleOpenBranchForm()}
              >
                Add Branch
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                /* Mobile Card View */
                <Box sx={{ p: 2 }}>
                  {branchesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : branchesError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{branchesError}</Typography>
                      <Button variant="outlined" onClick={fetchBranches} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : branches.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No branches found. Click 'Add Branch' to create a new branch.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {branches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((branch) => (
                          <Card key={branch.id} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{branch.branch_name}</Typography>
                                  <Typography variant="caption" color="textSecondary">Code: {branch.branch_code}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleOpenBranchForm(branch)} sx={{ color: '#1976d2', width: 40, height: 40 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteBranch(branch.id!)} sx={{ color: '#d32f2f', width: 40, height: 40 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Phone</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{branch.phone_number || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                  <Typography variant="caption" color="textSecondary" display="block">Address</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{branch.address || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={branches.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                /* Desktop Table View */
                <>
                  {branchesLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                  ) : branchesError ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{branchesError}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchBranches} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                      <TableContainer sx={{ height: '100%', width: '100%' }}>
                        <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Branch Code</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Branch Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Phone Number</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '18%', fontSize: '0.875rem', py: 2, border: 'none' }}>Address</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '12%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {branches.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                  <Typography variant="body2" color="textSecondary">No branches found. Click 'Add Branch' to create a new branch.</Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              branches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((branch) => (
                                <TableRow key={branch.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{branch.id}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{branch.branch_code}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{branch.branch_name}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{branch.phone_number}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{branch.address}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                    <Box display="flex" gap={1}>
                                      <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenBranchForm(branch)}>Edit</Button>
                                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => handleDeleteBranch(branch.id!)}>Delete</Button>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={branches.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', border: 'none', mt: 0 }} />
                    </>
                  )}
                </>
              )}
            </Box>

            {/* Branch Form Dialog */}
            <BranchForm
              open={isBranchFormOpen}
              onClose={handleCloseBranchForm}
              branch={currentBranch}
              onSave={handleSaveBranch}
              isSaving={isBranchSaving}
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
      case 'users':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Users Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UsersIcon />}
                size="large"
                onClick={() => handleOpenUserForm()}
              >
                Add User
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {usersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : usersError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{usersError}</Typography>
                      <Button variant="outlined" onClick={fetchUsers} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : users.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No users found. Click 'Add User' to create a new user.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                          <Card key={user.id} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{user.name}</Typography>
                                  <Typography variant="caption" color="textSecondary">ID: {user.id}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleOpenUserForm(user)} sx={{ color: '#1976d2', width: 40, height: 40 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteUser(user.id!)} sx={{ color: '#d32f2f', width: 40, height: 40 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Phone</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.phone_number || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                  <Typography variant="caption" color="textSecondary" display="block">Email</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.email || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={users.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                <>
                  {usersLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                  ) : usersError ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{usersError}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchUsers} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                      <TableContainer sx={{ height: '100%', width: '100%' }}>
                    <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Phone Number</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '30%', fontSize: '0.875rem', py: 2, border: 'none' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="textSecondary">
                                No users found. Click 'Add User' to create a new user.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          users
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((user) => (
                              <TableRow
                                key={user.id}
                                hover
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  border: 'none'
                                }}
                              >
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{user.id}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{user.name}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{user.phone_number}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none' }}>{user.email}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                  <Box display="flex" gap={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<EditIcon fontSize="small" />}
                                      onClick={() => handleOpenUserForm(user)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon fontSize="small" />}
                                      onClick={() => handleDeleteUser(user.id!)}
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
                    count={users.length}
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
                </>
              )}
            </Box>

            {/* User Form Dialog */}
            <UserForm
              open={isUserFormOpen}
              onClose={handleCloseUserForm}
              user={currentUser}
              onSave={handleSaveUser}
              isSaving={isUserSaving}
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
      case 'tests':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Tests Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TestsIcon />}
                size="large"
                onClick={() => handleOpenTestForm()}
              >
                Add Test
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {testsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : testsError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{testsError}</Typography>
                      <Button variant="outlined" onClick={fetchTests} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : tests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No tests found. Click 'Add Test' to create a new test.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((test) => (
                          <Card key={test.id} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{test.testname}</Typography>
                                  <Typography variant="caption" color="textSecondary">ID: {test.id}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleOpenTestForm(test)} sx={{ color: '#1976d2', width: 40, height: 40 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteTest(test.id!)} sx={{ color: '#d32f2f', width: 40, height: 40 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">B2C Cost</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{Number(test.cost_b2c).toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">B2B Cost</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{Number(test.cost_b2b).toFixed(2)}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={tests.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                <>
                  {testsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                  ) : testsError ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{testsError}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchTests} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                      <TableContainer sx={{ height: '100%', width: '100%' }}>
                        <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '45%', fontSize: '0.875rem', py: 2, border: 'none' }}>Test Name</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Cost (B2C)</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '25%', fontSize: '0.875rem', py: 2, border: 'none' }}>Cost (B2B)</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                  <Typography variant="body2" color="textSecondary">No tests found. Click 'Add Test' to create a new test.</Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              tests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((test) => (
                                <TableRow key={test.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{test.id}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{test.testname}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>₹{Number(test.cost_b2c).toFixed(2)}</TableCell>
                                  <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>₹{Number(test.cost_b2b).toFixed(2)}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                    <Box display="flex" gap={1}>
                                      <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenTestForm(test)}>Edit</Button>
                                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => handleDeleteTest(test.id!)}>Delete</Button>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination rowsPerPageOptions={[10, 25, 50]} component="div" count={tests.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} sx={{ backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', border: 'none', mt: 0 }} />
                    </>
                  )}
                </>
              )}
            </Box>

            {/* Test Form Dialog */}
            <TestForm
              open={isTestFormOpen}
              onClose={handleCloseTestForm}
              test={currentTest}
              onSave={handleSaveTest}
              isSaving={isTestSaving}
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
      case 'testpackages':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">
                Test Packages Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TestsIcon />}
                size="large"
                onClick={() => handleOpenTestPackageForm()}
              >
                Add Test Package
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {testPackagesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : testPackagesError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{testPackagesError}</Typography>
                      <Button variant="outlined" onClick={fetchTestPackages} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : !Array.isArray(testPackages) || testPackages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No test packages found. Click 'Add Test Package' to create a new package.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {testPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((testPackage) => (
                          <Card key={testPackage.id} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{testPackage.testpackage_name}</Typography>
                                  <Typography variant="caption" color="textSecondary">{testPackage.no_of_tests} Tests</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleOpenTestPackageForm(testPackage)} sx={{ color: '#1976d2', width: 40, height: 40 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteTestPackage(testPackage.id!)} sx={{ color: '#d32f2f', width: 40, height: 40 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">B2C Cost</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{Number(testPackage.cost_b2c).toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">B2B Cost</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{Number(testPackage.cost_b2b).toFixed(2)}</Typography>
                                </Box>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="textSecondary" display="block">Tests Included</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>{testPackage.list_of_tests || 'N/A'}</Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={testPackages.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                <>
                  {testPackagesLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                  ) : testPackagesError ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{testPackagesError}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchTestPackages} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                  <TableContainer sx={{ height: '100%', width: '100%' }}>
                    <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'fixed' }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '5%', fontSize: '0.875rem', py: 2, border: 'none' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '20%', fontSize: '0.875rem', py: 2, border: 'none' }}>Package Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>No. of Tests</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '27%', fontSize: '0.875rem', py: 2, border: 'none' }}>List of Tests</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '14%', fontSize: '0.875rem', py: 2, border: 'none' }}>Cost (B2C)</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '14%', fontSize: '0.875rem', py: 2, border: 'none' }}>Cost (B2B)</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', width: '10%', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!Array.isArray(testPackages) || testPackages.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="textSecondary">
                                No test packages found. Click 'Add Test Package' to create a new package.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (Array.isArray(testPackages) ? testPackages : [])
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((testPackage) => (
                              <TableRow
                                key={testPackage.id}
                                hover
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                  },
                                  border: 'none'
                                }}
                              >
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{testPackage.id}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{testPackage.testpackage_name}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>{testPackage.no_of_tests}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none', whiteSpace: 'normal', wordBreak: 'break-word' }} title={testPackage.list_of_tests}>
                                  <Box component="ul" sx={{ pl: 2, m: 0, listStyleType: 'disc' }}>
                                    {(testPackage.list_of_tests || '')
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                      .map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                      ))}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>₹{Number(testPackage.cost_b2c).toFixed(2)}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>₹{Number(testPackage.cost_b2b).toFixed(2)}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                                  <Box display="flex" gap={1}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<EditIcon fontSize="small" />}
                                      onClick={() => handleOpenTestPackageForm(testPackage)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon fontSize="small" />}
                                      onClick={() => handleDeleteTestPackage(testPackage.id!)}
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
                    count={testPackages.length}
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
                </>
              )}
            </Box>

            {/* Test Package Form Dialog */}
            <TestPackageForm
              open={isTestPackageFormOpen}
              onClose={handleCloseTestPackageForm}
              testPackage={currentTestPackage}
              onSave={handleSaveTestPackage}
              isSaving={isTestPackageSaving}
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
      case 'b2b-clients':
        return (
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">Clients</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<B2BClientsIcon />}
                size="large"
                onClick={() => handleOpenB2bForm()}
              >
                Add Client
              </Button>
            </Box>

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {b2bLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : b2bError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{b2bError}</Typography>
                      <Button variant="outlined" onClick={fetchB2bClients} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : !Array.isArray(b2bClients) || b2bClients.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No clients found. Click 'Add Client' to create a new client.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {b2bClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((client) => (
                          <Card key={client.id} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{client.institution_name}</Typography>
                                  <Typography variant="caption" color="textSecondary">ID: {client.id}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleOpenB2bForm(client)} sx={{ color: '#1976d2', width: 40, height: 40 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteB2bClient(client.id!)} sx={{ color: '#d32f2f', width: 40, height: 40 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Phone</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{client.phone_number || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Address</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{client.address || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={b2bClients.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                <>
                  {b2bLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
                  ) : b2bError ? (
                    <Box p={3} textAlign="center">
                      <Typography color="error">{b2bError}</Typography>
                      <Button variant="outlined" color="primary" onClick={fetchB2bClients} sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                  ) : (
                    <>
                  <TableContainer sx={{ height: '100%', width: '100%', overflowX: 'hidden' }}>
                    <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Institution Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Phone Number</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Address</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none', whiteSpace: 'nowrap' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!Array.isArray(b2bClients) || b2bClients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                              <Typography variant="body2" color="textSecondary">
                                No clients found. Click 'Add Client' to create a new client.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          (Array.isArray(b2bClients) ? b2bClients : [])
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((client) => (
                              <TableRow key={client.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none', whiteSpace: 'normal', wordBreak: 'break-word' }}>{client.institution_name}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none', whiteSpace: 'normal', wordBreak: 'break-word' }}>{client.phone_number || '—'}</TableCell>
                                <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none', whiteSpace: 'normal', wordBreak: 'break-word' }}>{client.address || '—'}</TableCell>
                                <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none', whiteSpace: 'nowrap' }}>
                                  <Box display="flex" gap={1}>
                                    <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenB2bForm(client)}>Edit</Button>
                                    <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => handleDeleteB2bClient(client.id!)}>Delete</Button>
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
                    count={b2bClients.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', border: 'none', mt: 0 }}
                  />
                    </>
                  )}
                </>
              )}
            </Box>

            <B2BClientForm
              open={isB2bFormOpen}
              onClose={handleCloseB2bForm}
              client={currentB2bClient}
              onSave={handleSaveB2bClient}
              isSaving={isB2bSaving}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>

            
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
          <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
              <Typography variant="h5">Sales</Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleOpenSalesForm}
              >
                + Add Sale
              </Button>
            </Box>

            {/* Modal Sales Form */}

            <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
              {isMobile ? (
                <Box sx={{ p: 2 }}>
                  {salesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                  ) : salesError ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error" gutterBottom>{salesError}</Typography>
                    </Box>
                  ) : sales.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="textSecondary">No sales yet. Click '+ Add Sale' to create one.</Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                          <Card key={sale.id || sale.invoice_no} sx={{ boxShadow: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Invoice #{sale.invoice_no}</Typography>
                                  <Typography variant="caption" color="textSecondary">{sale.date}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" disabled={!sale.id} onClick={() => handleEditSale(sale)} sx={{ color: '#1976d2', width: 36, height: 36 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" disabled={!sale.id} onClick={() => handleOpenReceipt(sale)} sx={{ color: '#9c27b0', width: 36, height: 36 }}>
                                    <PrintIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" disabled={!sale.id} onClick={() => handleDeleteSale(sale)} sx={{ color: '#d32f2f', width: 36, height: 36 }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Client</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{sale.client}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Patient</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{sale.patient_name || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Paid</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#2e7d32' }}>₹{Number(sale.advance || 0).toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Balance</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: (sale.balance_due || 0) > 0 ? '#d32f2f' : '#666' }}>₹{Number(sale.balance_due || 0).toFixed(2)}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Status</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{sale.status}</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="textSecondary" display="block">Ref. Doctor</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{sale.ref_by_doctor || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                      <TablePagination component="div" count={sales.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]} sx={{ mt: 2, borderTop: '1px solid #e0e0e0' }} />
                    </>
                  )}
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ height: '100%', width: '100%', overflowX: 'hidden' }}>
                  <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Invoice No</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Institution</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Ref.By Dr</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Patient Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Patient ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Paid</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Balance Due</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', py: 2, border: 'none', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : sales.length === 0 ? (
                      salesError ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                            <Typography color="error">{salesError}</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            No sales yet. Click '+ Add Sale' to create one.
                          </Typography>
                        </TableCell>
                      </TableRow>
                      )
                    ) : (
                      sales
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((sale) => (
                          <TableRow key={sale.id || sale.invoice_no} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.invoice_no}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.client}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.institution || '—'}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.ref_by_doctor || '—'}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.patient_name || '—'}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.patient_id || '—'}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{`₹${Number(sale.total || 0).toFixed(2)}`}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none', color: '#2e7d32', fontWeight: 500 }}>{`₹${Number(sale.advance || 0).toFixed(2)}`}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none', color: (sale.balance_due || 0) > 0 ? '#d32f2f' : '#666', fontWeight: 500 }}>{`₹${Number(sale.balance_due || 0).toFixed(2)}`}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.status}</TableCell>
                            <TableCell sx={{ py: 2, border: 'none' }}>{sale.date}</TableCell>
                            <TableCell sx={{ py: 1, border: 'none', whiteSpace: 'nowrap' }}>
                              <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" color="primary" startIcon={<EditIcon fontSize="small" />} disabled={!sale.id} onClick={() => handleEditSale(sale)}>Edit</Button>
                                <Button size="small" variant="outlined" color="secondary" startIcon={<PrintIcon fontSize="small" />} disabled={!sale.id} onClick={() => handleOpenReceipt(sale)}>Print</Button>
                                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon fontSize="small" />} disabled={!sale.id} onClick={() => handleDeleteSale(sale)}>Delete</Button>
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
                  count={sales.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', border: 'none', mt: 0 }}
                />
                </>
              )}
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
              <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>

            {/* Modal rendered only for Sales page */}
            <SalesForm
              open={isSalesFormOpen}
              onClose={handleCloseSalesForm}
              onSave={handleSaveSale}
              saleId={editingSale?.id as any}
              initialData={editingSale ? {
                date: editingSale.date,
                client_type: editingSale.client as any,
                b2b_client_name: editingSale.institution && editingSale.institution !== '—' ? editingSale.institution : null,
                ref_by_doctor_name: editingSale.ref_by_doctor && editingSale.ref_by_doctor !== '—' ? editingSale.ref_by_doctor : null,
                patient_name: editingSale.patient_name || '',
                // tests not available on list; leave empty so user can modify
                tests: [],
                discount_mode: 'amount',
                discount_value: 0,
                advance: 0,
                status: editingSale.status as any,
                payment_method: 'Cash'
              } : undefined}
              onUpdate={handleUpdateSale}
            />
          </Box>
        );
      case 'reports':
        return <Reports />;
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

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMenuItemClick = (itemId: string) => {
    handleListItemClick(itemId);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ minHeight: '64px', px: 2 }} />
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <StyledListItemButton
                selected={selectedItem === item.id}
                onClick={() => handleMenuItemClick(item.id)}
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
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', m: 0, p: 0 }}>
      {/* Mobile: AppBar with Hamburger Menu */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: '#1976d2'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Thyrosoft
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile: Temporary Drawer (slides from left) */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop: Permanent Drawer (always visible) */
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
          {drawerContent}
        </StyledDrawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          m: 0,
          backgroundColor: '#f5f5f5',
          overflow: 'auto',
          border: 'none',
          position: 'relative',
          mt: isMobile ? '64px' : 0,
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
        <SalesReceipt open={isReceiptOpen} saleId={receiptSaleId} onClose={handleCloseReceipt} />
      </Box>
    </Box>
  );
};

export default AddNew;
