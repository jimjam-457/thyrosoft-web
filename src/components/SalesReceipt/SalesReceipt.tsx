import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Typography } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';

type SaleItem = { type: 'test' | 'package'; id: number; name: string; price: number };

export interface SaleReceiptData {
  id: number;
  invoice_no: string;
  date: string;
  created_at?: string;
  client_type: string;
  institution_name?: string | null;
  doctor_name?: string | null;
  patient_id?: number | null;
  patient_name?: string | null;
  patient_age?: number | null;
  patient_gender?: string | null;
  items?: SaleItem[];
  discount_value?: number | null; // Paid (By Amount)
  advance?: number | null;
  balance_due?: number | null;
  total?: number | null;
}

interface SalesReceiptProps {
  open: boolean;
  saleId: number | null;
  onClose: () => void;
}

const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

const currency = (n: number | null | undefined) => `₹${Number(n || 0).toFixed(2)}`;

const SalesReceipt: React.FC<SalesReceiptProps> = ({ open, saleId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SaleReceiptData | null>(null);

  useEffect(() => {
    if (!open || !saleId) return;
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/sales/${saleId}`);
        setData(res.data as SaleReceiptData);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, saleId]);

  const subtotal = useMemo(() => (data?.items || []).reduce((s, it) => s + (it.price || 0), 0), [data]);
  const paid = useMemo(() => Number(data?.discount_value || 0) + Number(data?.advance || 0), [data]);
  const balance = useMemo(() => Number(data?.balance_due || 0), [data]);
  const grandTotal = useMemo(() => paid + balance, [paid, balance]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Receipt</DialogTitle>
      <DialogContent>
        {loading || !data ? (
          <Typography variant="body2">Loading...</Typography>
        ) : (
          <Box id="printable-receipt" sx={{ p: 2, backgroundColor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={700}>Order Date : {data.date}</Typography>
                <Typography fontWeight={700}>Receipt No : {data.invoice_no}</Typography>
                <Typography fontWeight={700}>Receipt Timestamp : {new Date().toLocaleString()}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight={700}>Thyrosoft</Typography>
                <Typography variant="body2">Tests you can trust</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography fontWeight={700}>Ref.by Lab/Dr.: {data.doctor_name || '—'}</Typography>
              <Typography sx={{ mt: 1 }}>
                Received with Thanks from <b>{data.patient_name || '—'}</b>
                {data.patient_id ? ` (ID: ${data.patient_id})` : ''}
                {` — ${data.patient_age ? `${data.patient_age}Y` : 'NA'}/${data.patient_gender || 'NA'}`}, an amount of <b>{currency(grandTotal)}</b>
              </Typography>
            </Box>

            <Box sx={{ border: '1px solid #000', mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px', background: '#f5f5f5', borderBottom: '1px solid #000' }}>
                <Box px={1} py={0.5}><Typography fontWeight={700}>SNO</Typography></Box>
                <Box px={1} py={0.5}><Typography fontWeight={700}>Services</Typography></Box>
                <Box px={1} py={0.5} textAlign="right"><Typography fontWeight={700}>Cost</Typography></Box>
              </Box>
              {(data.items && data.items.length > 0) ? (
                (data.items || []).map((it, idx) => (
                  <Box key={`${it.type}-${it.id}-${idx}`} sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px', borderBottom: '1px solid #e0e0e0' }}>
                    <Box px={1} py={0.5}><Typography>{idx + 1}</Typography></Box>
                    <Box px={1} py={0.5}><Typography>{it.name}</Typography></Box>
                    <Box px={1} py={0.5} textAlign="right"><Typography>{currency(it.price)}</Typography></Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px' }}>
                  <Box px={1} py={0.5}><Typography>1</Typography></Box>
                  <Box px={1} py={0.5}><Typography>Services</Typography></Box>
                  <Box px={1} py={0.5} textAlign="right"><Typography>{currency(subtotal)}</Typography></Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Box display="grid" gridTemplateColumns="1fr auto" rowGap={0.5} sx={{ minWidth: 280 }}>
                <Typography>Discount (Paid by Amount):</Typography>
                <Typography>{currency(data.discount_value || 0)}</Typography>
                <Typography>Advance Amount:</Typography>
                <Typography>{currency(data.advance || 0)}</Typography>
                <Typography>Balance Amount:</Typography>
                <Typography>{currency(data.balance_due || 0)}</Typography>
                <Typography fontWeight={700}>Grand Total:</Typography>
                <Typography fontWeight={700}>{currency(grandTotal)}</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700}>Specimen Collected at : {data.institution_name || '—'}</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption">This is system generated payment receipt. Does not require seal and signature.</Typography>
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end" mt={3}>
              <Button variant="outlined" onClick={onClose}>Close</Button>
              <Button variant="contained" onClick={handlePrint}>Print</Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SalesReceipt;
