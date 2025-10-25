import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { LocalHospital as DoctorIcon } from '@mui/icons-material';

interface DoctorFormProps {
  open: boolean;
  onClose: () => void;
  doctor?: any;
  onSave: (doctor: any) => void;
  isSaving: boolean;
}

const DoctorForm: React.FC<DoctorFormProps> = ({
  open,
  onClose,
  doctor,
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    clinicName: '',
    phone_number: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        specialization: doctor.specialization || '',
        clinicName: doctor.clinicName || '',
        phone_number: doctor.phone_number || ''
      });
    } else {
      // Reset form for new doctor
      setFormData({
        name: '',
        specialization: '',
        clinicName: '',
        phone_number: ''
      });
    }
  }, [doctor, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required';

    if (formData.phone_number && formData.phone_number.length < 10) {
      newErrors.phone_number = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <DoctorIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {doctor ? 'Edit Doctor' : 'Add New Doctor'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Doctor Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                margin="normal"
                size="small"
                placeholder="Enter 10-digit phone number"
              />
              <TextField
                fullWidth
                label="Specialization *"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                error={!!errors.specialization}
                helperText={errors.specialization}
                margin="normal"
                size="small"
                placeholder="e.g., Cardiology, Neurology"
              />
              <TextField
                fullWidth
                label="Clinic Name *"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                error={!!errors.clinicName}
                helperText={errors.clinicName}
                margin="normal"
                size="small"
                placeholder="e.g., City Heart Center"
              />
            </Box>
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
            {isSaving ? 'Saving...' : 'Save Doctor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DoctorForm;
