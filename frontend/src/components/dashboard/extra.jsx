import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Plus, Filter, Download, Trash2, Edit } from 'lucide-react';

export default function InvoiceGenerator() {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ id: null, client: '', amount: '', status: 'pending' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('invoices')) || [];
    setInvoices(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleSubmit = () => {
    if (!form.client || !form.amount) return;
    if (form.id) {
      setInvoices(invoices.map(inv => (inv.id === form.id ? form : inv)));
    } else {
      setInvoices([...invoices, { ...form, id: Date.now() }]);
    }
    setForm({ id: null, client: '', amount: '', status: 'pending' });
  };

  const handleEdit = (invoice) => setForm(invoice);
  const handleDelete = (id) => setInvoices(invoices.filter(inv => inv.id !== id));

  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    doc.text('Invoice', 14, 15);
    doc.text(`Client: ${invoice.client}`, 14, 25);
    doc.text(`Amount: ₹${invoice.amount}`, 14, 35);
    doc.text(`Status: ${invoice.status}`, 14, 45);
    doc.save(`invoice_${invoice.id}.pdf`);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Card className="shadow-xl border-none bg-white/80 backdrop-blur-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold text-gray-700">Invoice Generator</CardTitle>
          <div className="flex items-center gap-3">
            <Input placeholder="Search client..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </Select>
            <Button onClick={() => setForm({ id: null, client: '', amount: '', status: 'pending' })} className="flex items-center gap-1"><Plus size={16}/>Add</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Input placeholder="Client Name" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            <Input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </Select>
          </motion.div>
          <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">{form.id ? 'Update Invoice' : 'Add Invoice'}</Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredInvoices.map(inv => (
          <motion.div key={inv.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition">
            <div>
              <p className="text-lg font-semibold text-gray-800">{inv.client}</p>
              <p className="text-gray-500">₹{inv.amount}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-600' : inv.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>{inv.status}</span>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={() => generatePDF(inv)}><Download size={16}/></Button>
              <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}><Edit size={16}/></Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}><Trash2 size={16}/></Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}