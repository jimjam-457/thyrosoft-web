import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';

export interface B2BClient {
  id?: number;
  institution_name: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
}

interface B2BClientFormProps {
  open: boolean;
  onClose: () => void;
  client: B2BClient | null;
  onSave: (client: B2BClient) => void;
  isSaving: boolean;
}

const B2BClientForm: React.FC<B2BClientFormProps> = ({ open, onClose, client, onSave, isSaving }) => {
  const [formData, setFormData] = useState<B2BClient>({
    institution_name: '',
    phone_number: '',
    address: ''
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({ institution_name: '', phone_number: '', address: '' });
    }
  }, [client, open]);

  const handleChange = (field: keyof B2BClient, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({ institution_name: '', phone_number: '', address: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Edit Client' : 'Add Client'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Institution Name"
            fullWidth
            variant="outlined"
            value={formData.institution_name}
            onChange={(e) => handleChange('institution_name', e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={formData.phone_number || ''}
            onChange={(e) => handleChange('phone_number', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            variant="outlined"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : (client ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default B2BClientForm;
