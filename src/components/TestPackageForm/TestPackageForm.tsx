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

interface TestPackage {
  id?: number;
  testpackage_name: string;
  no_of_tests: number;
  list_of_tests: string;
  cost_b2c: number;
  cost_b2b: number;
  created_at?: string;
}

interface TestPackageFormProps {
  open: boolean;
  onClose: () => void;
  testPackage: TestPackage | null;
  onSave: (testPackage: TestPackage) => void;
  isSaving: boolean;
}

const TestPackageForm: React.FC<TestPackageFormProps> = ({ open, onClose, testPackage, onSave, isSaving }) => {
  const [formData, setFormData] = useState<TestPackage>({
    testpackage_name: '',
    no_of_tests: 0,
    list_of_tests: '',
    cost_b2c: 0,
    cost_b2b: 0,
  });

  useEffect(() => {
    if (testPackage) {
      setFormData(testPackage);
    } else {
      setFormData({
        testpackage_name: '',
        no_of_tests: 0,
        list_of_tests: '',
        cost_b2c: 0,
        cost_b2b: 0,
      });
    }
  }, [testPackage, open]);

  const handleChange = (field: keyof TestPackage, value: string | number) => {
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
      testpackage_name: '',
      no_of_tests: 0,
      list_of_tests: '',
      cost_b2c: 0,
      cost_b2b: 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {testPackage ? 'Edit Test Package' : 'Add New Test Package'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Package Name"
            fullWidth
            variant="outlined"
            value={formData.testpackage_name}
            onChange={(e) => handleChange('testpackage_name', e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Number of Tests"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.no_of_tests}
            onChange={(e) => handleChange('no_of_tests', parseInt(e.target.value) || 0)}
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="dense"
            label="List of Tests (comma separated)"
            fullWidth
            variant="outlined"
            value={formData.list_of_tests}
            onChange={(e) => handleChange('list_of_tests', e.target.value)}
            required
            multiline
            rows={3}
            placeholder="e.g., CBC, Lipid Profile, Thyroid Function Test"
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
            {isSaving ? <CircularProgress size={20} /> : (testPackage ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TestPackageForm;
