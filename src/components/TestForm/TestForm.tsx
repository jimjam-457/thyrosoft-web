import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

interface Test {
  id?: number;
  testname: string;
  cost_b2c: number;
  cost_b2b: number;
  created_at?: string;
}

interface TestFormProps {
  open: boolean;
  onClose: () => void;
  test: Test | null;
  onSave: (test: Test) => void;
  isSaving: boolean;
}

const TestForm: React.FC<TestFormProps> = ({ open, onClose, test, onSave, isSaving }) => {
  const [formData, setFormData] = useState<Test>({
    testname: '',
    cost_b2c: 0,
    cost_b2b: 0,
  });

  useEffect(() => {
    if (test) {
      setFormData(test);
    } else {
      setFormData({
        testname: '',
        cost_b2c: 0,
        cost_b2b: 0,
      });
    }
  }, [test, open]);

  const handleChange = (field: keyof Test, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      testname: '',
      cost_b2c: 0,
      cost_b2b: 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {test ? 'Edit Test' : 'Add New Test'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Name"
            fullWidth
            variant="outlined"
            value={formData.testname}
            onChange={(e) => handleChange('testname', e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Cost (B2C)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.cost_b2c}
            onChange={(e) => handleChange('cost_b2c', parseFloat(e.target.value) || 0)}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            margin="dense"
            label="Cost (B2B)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.cost_b2b}
            onChange={(e) => handleChange('cost_b2b', parseFloat(e.target.value) || 0)}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : (test ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TestForm;
