import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button, IconButton, InputAdornment, FormControlLabel, Radio, RadioGroup, Checkbox, Typography, Paper, Box, Divider, CircularProgress } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';

export interface SalesRecordInput {
  date: string;
  branch_id?: number | null;
  branch_name?: string;
  client_type: 'B2C' | 'B2B';
  b2b_client_id?: number | null;
  b2b_client_name?: string | null;
  ref_by_doctor_id?: number | null;
  ref_by_doctor_name?: string | null;
  patient_id?: number | null;
  patient_name: string;
  tests: Array<{ type: 'test' | 'package'; id: number; name: string; price: number }>; 
  discount_mode: 'amount' | 'percentage';
  discount_value: number;
  advance: number;
  next_checkup?: string | null;
  google_review?: boolean;
  status: 'Pending' | 'Done';
  payment_method: 'Cash' | 'Card' | 'UPI';
}

export interface SalesFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (record: SalesRecordInput & { total: number; balance_due: number }) => void;
  inline?: boolean;
  saleId?: number;
  initialData?: Partial<SalesRecordInput>;
  onUpdate?: (id: number, record: SalesRecordInput & { total: number; balance_due: number }) => void;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

interface Option { id: number; label: string; }

const SalesForm: React.FC<SalesFormProps> = ({ open, onClose, onSave, inline, saleId, initialData, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState<Option[]>([]);
  const [doctors, setDoctors] = useState<Option[]>([]);
  const [patients, setPatients] = useState<Option[]>([]);
  const [tests, setTests] = useState<{ id: number; name: string; price: number }[]>([]);
  const [packages, setPackages] = useState<{ id: number; name: string; price: number }[]>([]);
  const [b2bClients, setB2bClients] = useState<Option[]>([]);

  const defaultForm: SalesRecordInput = {
    date: new Date().toISOString().split('T')[0],
    branch_id: null,
    branch_name: '',
    client_type: 'B2C',
    b2b_client_id: null,
    b2b_client_name: null,
    ref_by_doctor_id: null,
    ref_by_doctor_name: null,
    patient_id: null,
    patient_name: '',
    tests: [],
    discount_mode: 'amount',
    discount_value: 0,
    advance: 0,
    next_checkup: null,
    google_review: false,
    status: 'Pending',
    payment_method: 'Cash',
  };
  const [form, setForm] = useState<SalesRecordInput>(defaultForm);

  const subtotal = useMemo(() => form.tests.reduce((sum, t) => sum + (t.price || 0), 0), [form.tests]);
  const discountAmount = useMemo(() => {
    if (form.discount_mode === 'amount') return Math.min(form.discount_value || 0, subtotal);
    const pct = Math.max(0, Math.min(100, form.discount_value || 0));
    return +(subtotal * (pct / 100)).toFixed(2);
  }, [form.discount_mode, form.discount_value, subtotal]);
  const total = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
  const balanceDue = useMemo(() => Math.max(0, total - (form.advance || 0)), [total, form.advance]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      api.get('/branches'),
      api.get('/doctors'),
      api.get('/patients'),
      api.get('/tests'),
      api.get('/testpackages'),
      api.get('/b2b-clients'),
    ])
      .then(([branchesRes, doctorsRes, patientsRes, testsRes, packagesRes, clientsRes]) => {
        const branchesArr = (branchesRes.data as any[]) || [];
        const doctorsArr = (doctorsRes.data as any[]) || [];
        const patientsArr = (patientsRes.data as any[]) || [];
        const testsArr = (testsRes.data as any[]) || [];
        const packagesArr = (packagesRes.data as any[]) || [];
        const clientsArr = (clientsRes.data as any[]) || [];
        setBranches(branchesArr.map((b: any) => ({ id: b.id, label: b.branch_name })));
        setDoctors(doctorsArr.map((d: any) => ({ id: d.id, label: d.name })));
        setPatients(patientsArr.map((p: any) => ({ id: p.id, label: p.name })));
        setTests(testsArr.map((t: any) => ({ id: t.id, name: t.testname, price: Number(t.cost_b2c) })));
        setPackages(packagesArr.map((pk: any) => ({ id: pk.id, name: pk.testpackage_name, price: Number(pk.cost_b2c) })));
        setB2bClients(clientsArr.map((c: any) => ({ id: c.id, label: c.institution_name })));
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Reset/prefill form on open
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm(prev => ({
        ...defaultForm,
        ...initialData,
        tests: (initialData.tests as any) || [],
      }));
    } else {
      setForm({ ...defaultForm, date: new Date().toISOString().split('T')[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saleId, initialData]);

  const addItem = (item: { type: 'test' | 'package'; id: number; name: string; price: number }) => {
    setForm(prev => ({ ...prev, tests: [...prev.tests, item] }));
  };
  const removeLastItem = () => {
    setForm(prev => ({ ...prev, tests: prev.tests.slice(0, -1) }));
  };
  const removeItemAt = (idx: number) => {
    setForm(prev => ({ ...prev, tests: prev.tests.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (saleId && onUpdate) {
        try { await api.put(`/sales/${saleId}`, { ...payload, total, balance_due: balanceDue, tests: payload.tests }); } catch {}
        onUpdate(saleId, { ...payload, total, balance_due: balanceDue });
      } else {
        // try to POST to backend if exists
        try { await api.post('/sales', { ...payload, total, balance_due: balanceDue }); } catch {}
        onSave({ ...payload, total, balance_due: balanceDue });
      }
      setForm({ ...defaultForm, date: new Date().toISOString().split('T')[0] });
    } finally {
      setSaving(false);
    }
  };

  const FormBody = (
    <>
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField type="date" fullWidth label="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField select fullWidth label="Branch" value={form.branch_id ?? ''} onChange={(e) => setForm({ ...form, branch_id: Number(e.target.value) || null, branch_name: branches.find(b=>b.id===Number(e.target.value))?.label })}>
              {branches.map(b => (<MenuItem key={b.id} value={b.id}>{b.label}</MenuItem>))}
            </TextField>
            <TextField select fullWidth label="Client Type" value={form.client_type} onChange={(e) => setForm({ ...form, client_type: e.target.value as any, b2b_client_id: null, b2b_client_name: null })}>
              <MenuItem value="B2C">B2C</MenuItem>
              <MenuItem value="B2B">B2B</MenuItem>
            </TextField>
            <TextField select fullWidth label="Ref.by Dr" value={form.ref_by_doctor_id ?? ''} onChange={(e) => setForm({ ...form, ref_by_doctor_id: Number(e.target.value) || null, ref_by_doctor_name: doctors.find(d=>d.id===Number(e.target.value))?.label || null })}>
              {doctors.map(d => (<MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>))}
            </TextField>
            <TextField select fullWidth disabled={form.client_type!== 'B2B'} label="Institution" value={form.b2b_client_id ?? ''} onChange={(e) => setForm({ ...form, b2b_client_id: Number(e.target.value) || null, b2b_client_name: b2bClients.find(c=>c.id===Number(e.target.value))?.label || null })}>
              {b2bClients.map(c => (<MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>))}
            </TextField>
            <TextField select fullWidth label="Patient" value={form.patient_id ?? ''} onChange={(e) => setForm({ ...form, patient_id: Number(e.target.value) || null, patient_name: patients.find(p=>p.id===Number(e.target.value))?.label || '' })} SelectProps={{ displayEmpty: true }} placeholder="Patient Name">
              <MenuItem value="">-- New Patient --</MenuItem>
              {patients.map(p => (<MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>))}
            </TextField>
            <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
              <TextField fullWidth label="If new, type patient name" value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
            </Box>
          </Box>

          <Box mt={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700}>TEST NAME</Typography>
                <Typography variant="subtitle2" fontWeight={700}>ACTIONS</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField select fullWidth label="Search Test" value="" onChange={(e) => {
                  const id = Number(e.target.value);
                  const t = tests.find(tt => tt.id === id);
                  if (t) addItem({ type: 'test', id: t.id, name: t.name, price: t.price });
                }}>
                  {tests.map(t => (<MenuItem key={t.id} value={t.id}>{t.name} — ₹{t.price}</MenuItem>))}
                </TextField>
                <TextField select fullWidth label="Search Test Package" value="" onChange={(e) => {
                  const id = Number(e.target.value);
                  const p = packages.find(pp => pp.id === id);
                  if (p) addItem({ type: 'package', id: p.id, name: p.name, price: p.price });
                }}>
                  {packages.map(p => (<MenuItem key={p.id} value={p.id}>{p.name} — ₹{p.price}</MenuItem>))}
                </TextField>
              </Box>
              <Box mt={2}>
                {form.tests.map((t, idx) => (
                  <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                    <Typography variant="body2">{t.name}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">₹ {t.price}</Typography>
                      <IconButton size="small" onClick={() => removeItemAt(idx)} aria-label="remove">
                        <Remove fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={1}>
                <Typography variant="subtitle2">Total Cost: ₹ {subtotal}</Typography>
              </Box>
            </Paper>
          </Box>

          <Box mt={2} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Discount</Typography>
              <RadioGroup row value={form.discount_mode} onChange={(e) => setForm({ ...form, discount_mode: e.target.value as any })}>
                <FormControlLabel value="amount" control={<Radio />} label="Amount" />
                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
              </RadioGroup>
            </Box>
            <TextField fullWidth label="By Amount" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value || 0) })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField fullWidth label="Paid" type="number" value={form.advance} onChange={(e) => setForm({ ...form, advance: Number(e.target.value || 0) })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            <TextField fullWidth label="Balance Due" value={balanceDue} InputProps={{ readOnly: true }} />
          </Box>

          <Box mt={2} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField type="date" fullWidth label="Next Check-Up" value={form.next_checkup || ''} onChange={(e) => setForm({ ...form, next_checkup: e.target.value })} InputLabelProps={{ shrink: true }} />
            <Box display="flex" alignItems="center"><FormControlLabel control={<Checkbox checked={!!form.google_review} onChange={(e) => setForm({ ...form, google_review: e.target.checked })} />} label="Google Review" /></Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Status</Typography>
              <RadioGroup row value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                <FormControlLabel value="Pending" control={<Radio />} label="Pending" />
                <FormControlLabel value="Done" control={<Radio />} label="Done" />
              </RadioGroup>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Payment Method</Typography>
              <RadioGroup row value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as any })}>
                <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="Card" control={<Radio />} label="Card" />
                <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
              </RadioGroup>
            </Box>
          </Box>

          <Box mt={2} display="flex" justifyContent="flex-end" gap={4}>
            <Typography>Discount Amount: ₹ {discountAmount}</Typography>
            <Typography>Total Amount: ₹ {total}</Typography>
          </Box>
        </Box>
      )}
    </>
  );

  if (inline) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Sales</Typography>
        {FormBody}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || subtotal<=0}>
            {saving ? <CircularProgress size={20} /> : 'Add Sales'}
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Dialog open={open} keepMounted onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{saleId ? 'Edit Sales' : 'Add Sales'}</DialogTitle>
      <DialogContent dividers>{FormBody}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || subtotal<=0}>
          {saving ? <CircularProgress size={20} /> : (saleId ? 'Update Sales' : 'Add Sales')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SalesForm;
