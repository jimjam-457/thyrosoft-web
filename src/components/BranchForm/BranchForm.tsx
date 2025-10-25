import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormHelperText,
  Box,
  CircularProgress,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { Business as BranchIcon } from '@mui/icons-material';

interface Branch {
  id?: number;
  branch_code: string;
  branch_name: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
}

interface BranchFormProps {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onSave: (branch: Branch) => void;
  isSaving: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  open,
  onClose,
  branch,
  onSave,
  isSaving
}) => {
  const [formData, setFormData] = useState<Branch>({
    branch_code: '',
    branch_name: '',
    phone_number: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (branch) {
      setFormData({
        branch_code: branch.branch_code || '',
        branch_name: branch.branch_name || '',
        phone_number: branch.phone_number || '',
        address: branch.address || ''
      });
    } else {
      // Reset form for new branch
      setFormData({
        branch_code: '',
        branch_name: '',
        phone_number: '',
        address: ''
      });
    }
  }, [branch, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.branch_code.trim()) {
      newErrors.branch_code = 'Branch code is required';
    } else if (formData.branch_code.length < 3) {
      newErrors.branch_code = 'Branch code must be at least 3 characters';
    }

    if (!formData.branch_name.trim()) {
      newErrors.branch_name = 'Branch name is required';
    }

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
          <BranchIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Paper elevation={0} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Branch Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch Code *"
                  name="branch_code"
                  value={formData.branch_code}
                  onChange={handleChange}
                  error={!!errors.branch_code}
                  helperText={errors.branch_code}
                  margin="normal"
                  size="small"
                  disabled={!!branch}
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Branch Name *"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  error={!!errors.branch_name}
                  helperText={errors.branch_name}
                  margin="normal"
                  size="small"
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
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
                />
              </Grid>
              {/* @ts-ignore */}
              <Grid item xs={12} md={6}>
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
            {isSaving ? 'Saving...' : 'Save Branch'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BranchForm;
