import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Refresh as RefreshIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import axios from 'axios';

interface ReferralReport {
  id: number;
  doctor_or_b2b_client: string;
  type: 'doctor' | 'b2b';
  total_referrals: number;
  patients: {
    patient_name: string;
    tests: string[];
    b2b_amount: number;
  }[];
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  created_at: string;
}

const Reports: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReferralReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReferralReport | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:3771/api';

  useEffect(() => {
    fetchReferralReports();
  }, []);

  const fetchReferralReports = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching reports from:', `${API_BASE_URL}/reports/referrals`);
      const response = await axios.get<ReferralReport[]>(`${API_BASE_URL}/reports/referrals`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log('✅ Reports API response:', response.data);
      console.log('📊 Response type:', typeof response.data, 'Is Array:', Array.isArray(response.data));
      
      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setReports(response.data);
        if (response.data.length === 0) {
          console.log('ℹ️ No reports found');
        }
      } else {
        console.error('❌ API returned non-array data:', response.data);
        setReports([]);
        setError('Invalid data format received from server');
      }
    } catch (err: any) {
      console.error('❌ Error fetching referral reports:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || err.message || 'Failed to fetch reports');
      setReports([]); // Ensure reports is always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = (report: ReferralReport) => {
    setSelectedReport(report);
    setPrintDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setSelectedReport(null);
  };

  return (
    <Box sx={{ p: 0, m: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Referral Reports
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchReferralReports}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 0, m: 0, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4, px: 3 }}>
            <Typography color="error" gutterBottom>{error}</Typography>
            <Button variant="outlined" onClick={fetchReferralReports} sx={{ mt: 2 }}>Retry</Button>
          </Box>
        ) : (
          <>
            {isMobile ? (
              /* Mobile Card View */
              <Box sx={{ p: 2 }}>
                {reports.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      No referral reports found.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reports.map((report) => (
                      <Card key={report.id} sx={{ boxShadow: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {report.doctor_or_b2b_client}
                              </Typography>
                              <Chip
                                label={report.type === 'doctor' ? 'Doctor' : 'B2B Client'}
                                size="small"
                                color={report.type === 'doctor' ? 'primary' : 'secondary'}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handlePrintReport(report)}
                              sx={{ color: '#1976d2' }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                            <Box>
                              <Typography variant="caption" color="textSecondary" display="block">Referrals</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{report.total_referrals}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="textSecondary" display="block">Amount</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2e7d32' }}>₹{report.total_amount.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: '1 / -1' }}>
                              <Typography variant="caption" color="textSecondary" display="block">Payment Status</Typography>
                              <Chip
                                label={report.payment_status.toUpperCase()}
                                size="small"
                                color={report.payment_status === 'paid' ? 'success' : report.payment_status === 'pending' ? 'warning' : 'default'}
                                icon={report.payment_status === 'paid' ? <PaidIcon /> : <PendingIcon />}
                              />
                            </Box>
                          </Box>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 0.5 }}>Patients & Tests:</Typography>
                          {report.patients.map((patient, idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                {patient.patient_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {patient.tests.join(', ')} - ₹{patient.b2b_amount.toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              /* Desktop Table View */
              <TableContainer sx={{ height: '100%', width: '100%' }}>
                <Table sx={{ minWidth: '100%', width: '100%', tableLayout: 'auto' }} stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Doctor/B2B Client</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>No. of Referrals</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Patients & Tests</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Amount to be Paid</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Payment Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', fontSize: '0.875rem', py: 2, border: 'none' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            No referral reports found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      reports.map((report) => (
                        <TableRow key={report.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' }, border: 'none' }}>
                          <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>
                            {report.doctor_or_b2b_client}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>
                            <Chip
                              label={report.type === 'doctor' ? 'Doctor' : 'B2B Client'}
                              size="small"
                              color={report.type === 'doctor' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>
                            {report.total_referrals}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 2, border: 'none', maxWidth: '300px' }}>
                            {report.patients.map((patient, idx) => (
                              <Box key={idx} sx={{ mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                                  {patient.patient_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {patient.tests.join(', ')} - ₹{patient.b2b_amount.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none', fontWeight: 600, color: '#2e7d32' }}>
                            ₹{report.total_amount.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', py: 2, border: 'none' }}>
                            <Chip
                              label={report.payment_status.toUpperCase()}
                              size="small"
                              color={report.payment_status === 'paid' ? 'success' : report.payment_status === 'pending' ? 'warning' : 'default'}
                              icon={report.payment_status === 'paid' ? <PaidIcon /> : <PendingIcon />}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 1, border: 'none' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<PrintIcon fontSize="small" />}
                              onClick={() => handlePrintReport(report)}
                            >
                              Print
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0' }}>
          Referral Report - {selectedReport?.doctor_or_b2b_client}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReport && (
            <Box id="print-content">
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                {selectedReport.type === 'doctor' ? 'Doctor' : 'B2B Client'}: {selectedReport.doctor_or_b2b_client}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">Total Referrals: {selectedReport.total_referrals}</Typography>
                <Typography variant="body2" color="textSecondary">Report Date: {new Date(selectedReport.created_at).toLocaleDateString()}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Patients Referred:</Typography>
              {selectedReport.patients.map((patient, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{patient.patient_name}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Tests: {patient.tests.join(', ')}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#2e7d32', fontWeight: 500 }}>B2B Amount: ₹{patient.b2b_amount.toFixed(2)}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'right', p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  Total B2B Amount: ₹{selectedReport.total_amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Payment Status: <Chip label={selectedReport.payment_status.toUpperCase()} size="small" color={selectedReport.payment_status === 'paid' ? 'success' : 'warning'} />
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button onClick={handleClosePrintDialog}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;