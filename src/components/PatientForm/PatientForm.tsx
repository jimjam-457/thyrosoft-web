import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { LocalHospital as TestTubeIcon } from '@mui/icons-material';
import { SelectProps } from '@mui/material/Select/Select';

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  patient?: any;
  onSave: (patient: any) => void;
  isSaving: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ 
  open, 
  onClose, 
  patient,
  onSave,
  isSaving 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    patient_id: '',
    barcode_number: '',
    test_type: '',
    date: new Date().toISOString().split('T')[0],
    doctor_referred: '',
    branch: '',
    price: '',
    contact_number: '',
    address: '',
    gender: '',
    age: '',
    email: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        patient_id: patient.patient_id || '',
        barcode_number: patient.barcode_number || '',
        test_type: patient.test_type || '',
        date: patient.date || new Date().toISOString().split('T')[0],
        doctor_referred: patient.doctor_referred || '',
        branch: patient.branch || '',
        price: patient.price || '',
        contact_number: patient.contact_number || '',
        address: patient.address || '',
        gender: patient.gender || '',
        age: patient.age || '',
        email: patient.email || ''
      });
    } else {
      // Reset form for new patient
      setFormData({
        name: '',
        patient_id: '',
        barcode_number: '',
        test_type: '',
        date: new Date().toISOString().split('T')[0],
        doctor_referred: '',
        branch: '',
        price: '',
        contact_number: '',
        address: '',
        gender: '',
        age: '',
        email: ''
      });
    }
  }, [patient, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.patient_id.trim()) newErrors.patient_id = 'Patient ID is required';
    if (!formData.test_type) newErrors.test_type = 'Test type is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        price: formData.price ? parseFloat(formData.price) : null
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <TestTubeIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Patient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Patient ID *"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  error={!!errors.patient_id}
                  helperText={errors.patient_id}
                  margin="normal"
                  size="small"
                  disabled={!!patient}
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" size="small" error={!!errors.gender}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender *"
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Number *"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  error={!!errors.contact_number}
                  helperText={errors.contact_number}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  margin="normal"
                  size="small"
                />
              </Grid>
            </Grid>
            {/* @ts-ignore */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                margin="normal"
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Test Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Type *"
                  name="test_type"
                  value={formData.test_type}
                  onChange={handleChange}
                  error={!!errors.test_type}
                  helperText={errors.test_type}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Barcode Number"
                  name="barcode_number"
                  value={formData.barcode_number}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doctor Referred"
                  name="doctor_referred"
                  value={formData.doctor_referred}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                  InputProps={{
                    startAdornment: '₹',
                  }}
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Patient'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PatientForm;
