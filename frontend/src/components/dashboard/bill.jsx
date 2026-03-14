// import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { motion } from 'framer-motion';
// import { Button } from "../ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Input } from "../ui/input";
// import { Select, SelectItem } from "../ui/select";
// import { Plus, Filter, Download, Trash2, Edit } from 'lucide-react';

// export default function InvoiceGenerator() {
//   const [invoices, setInvoices] = useState([]);
//   const [form, setForm] = useState({ id: null, client: '', amount: '', status: 'pending' });
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem('invoices')) || [];
//     setInvoices(stored);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('invoices', JSON.stringify(invoices));
//   }, [invoices]);

//   const handleSubmit = () => {
//     if (!form.client || !form.amount) return;
//     if (form.id) {
//       setInvoices(invoices.map(inv => (inv.id === form.id ? form : inv)));
//     } else {
//       setInvoices([...invoices, { ...form, id: Date.now() }]);
//     }
//     setForm({ id: null, client: '', amount: '', status: 'pending' });
//   };

//   const handleEdit = (invoice) => setForm(invoice);
//   const handleDelete = (id) => setInvoices(invoices.filter(inv => inv.id !== id));

//   const filteredInvoices = invoices.filter(inv => {
//     const matchesFilter = filter === 'all' || inv.status === filter;
//     const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   const generatePDF = (invoice) => {
//     const doc = new jsPDF();
//     doc.text('Invoice', 14, 15);
//     doc.text(`Client: ${invoice.client}`, 14, 25);
//     doc.text(`Amount: ₹${invoice.amount}`, 14, 35);
//     doc.text(`Status: ${invoice.status}`, 14, 45);
//     doc.save(`invoice_${invoice.id}.pdf`);
//   };

//   return (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <Card className="shadow-xl border-none bg-white/80 backdrop-blur-md">
//         <CardHeader className="flex justify-between items-center">
//           <CardTitle className="text-2xl font-semibold text-gray-700">Invoice Generator</CardTitle>
//           <div className="flex items-center gap-3">
//             <Input placeholder="Search client..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
//             <Select value={filter} onValueChange={setFilter}>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="paid">Paid</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//             </Select>
//             <Button onClick={() => setForm({ id: null, client: '', amount: '', status: 'pending' })} className="flex items-center gap-1"><Plus size={16}/>Add</Button>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             <Input placeholder="Client Name" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
//             <Input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
//             <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="paid">Paid</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//             </Select>
//           </motion.div>
//           <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">{form.id ? 'Update Invoice' : 'Add Invoice'}</Button>
//         </CardContent>
//       </Card>

//       <div className="space-y-4">
//         {filteredInvoices.map(inv => (
//           <motion.div key={inv.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition">
//             <div>
//               <p className="text-lg font-semibold text-gray-800">{inv.client}</p>
//               <p className="text-gray-500">₹{inv.amount}</p>
//               <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-600' : inv.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>{inv.status}</span>
//             </div>
//             <div className="flex gap-3">
//               <Button size="sm" variant="outline" onClick={() => generatePDF(inv)}><Download size={16}/></Button>
//               <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}><Edit size={16}/></Button>
//               <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}><Trash2 size={16}/></Button>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion } from 'framer-motion';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectItem } from "../ui/select";
import { Plus, Download, Trash2, Edit } from 'lucide-react';

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
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── PALETTE ──────────────────────────────────────────────
    const navy   = [15,  23,  42];   // #0f172a
    const indigo = [79,  70, 229];   // #4f46e5
    const slate  = [100, 116, 139];  // #64748b
    const light  = [241, 245, 249];  // #f1f5f9
    const white  = [255, 255, 255];
    const green  = [22,  163,  74];
    const amber  = [217, 119,   6];
    const blue   = [37,  99,  235];

    // ── HERO HEADER BAND ─────────────────────────────────────
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 52, 'F');

    // Accent stripe
    doc.setFillColor(...indigo);
    doc.rect(0, 48, pageW, 4, 'F');

    // Company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(...white);
    doc.text('YOUR COMPANY', 14, 22);

    // Tagline
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Professional Invoicing', 14, 30);

    // INVOICE label (top-right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(...indigo);
    const invoiceLabel = 'INVOICE';
    const lblW = doc.getTextWidth(invoiceLabel);
    doc.text(invoiceLabel, pageW - 14 - lblW, 24);

    // Invoice number & date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    const invNum = `#INV-${String(invoice.id).slice(-6)}`;
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.text(invNum, pageW - 14 - doc.getTextWidth(invNum), 32);
    doc.text(dateStr, pageW - 14 - doc.getTextWidth(dateStr), 39);

    // ── BILL TO / FROM SECTION ────────────────────────────────
    const sectionY = 62;

    // Bill To box
    doc.setFillColor(...light);
    doc.roundedRect(14, sectionY, 80, 38, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text('BILL TO', 20, sectionY + 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...navy);
    doc.text(invoice.client, 20, sectionY + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...slate);
    doc.text('Client', 20, sectionY + 26);

    // Invoice Details box
    doc.setFillColor(...light);
    doc.roundedRect(pageW - 94, sectionY, 80, 38, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text('INVOICE DETAILS', pageW - 88, sectionY + 9);

    const detailRows = [
      ['Invoice No.',  invNum],
      ['Issue Date',   dateStr],
      ['Due Date',     getDueDate()],
      ['Status',       invoice.status.toUpperCase()],
    ];

    detailRows.forEach(([label, value], i) => {
      const rowY = sectionY + 17 + i * 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slate);
      doc.text(label, pageW - 88, rowY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text(value, pageW - 14 - doc.getTextWidth(value), rowY);
    });

    // ── LINE ITEMS TABLE ──────────────────────────────────────
    const tableY = sectionY + 48;

    doc.autoTable({
      startY: tableY,
      margin: { left: 14, right: 14 },
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: [
        ['1', `Services — ${invoice.client}`, '1', formatINR(invoice.amount), formatINR(invoice.amount)],
      ],
      headStyles: {
        fillColor: navy,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      },
      bodyStyles: {
        fontSize: 9,
        textColor: navy,
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 32, halign: 'right' },
      },
      tableLineColor: light,
      tableLineWidth: 0.3,
    });

    // ── TOTALS BLOCK ──────────────────────────────────────────
    const afterTable = doc.lastAutoTable.finalY + 6;
    const totBoxX = pageW - 14 - 75;

    const subtotal = parseFloat(invoice.amount);
    const tax = +(subtotal * 0.18).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    const totRows = [
      ['Subtotal',  formatINR(subtotal), false],
      ['GST (18%)', formatINR(tax),      false],
      ['TOTAL',     formatINR(total),    true ],
    ];

    let ty = afterTable;
    totRows.forEach(([label, value, isBold]) => {
      if (isBold) {
        doc.setFillColor(...indigo);
        doc.roundedRect(totBoxX, ty - 4, 75, 11, 2, 2, 'F');
        doc.setTextColor(...white);
      } else {
        doc.setTextColor(...slate);
      }
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isBold ? 10 : 8.5);
      doc.text(label, totBoxX + 5, ty + 3.5);
      const valX = totBoxX + 75 - 5 - doc.getTextWidth(value);
      doc.text(value, valX, ty + 3.5);
      ty += 13;
    });

    // ── STATUS BADGE ──────────────────────────────────────────
    const badgeColor = invoice.status === 'paid' ? green : invoice.status === 'completed' ? blue : amber;
    const badgeText  = invoice.status.toUpperCase();
    const badgeW = doc.getTextWidth(badgeText) + 14;
    doc.setFillColor(...badgeColor);
    doc.roundedRect(14, afterTable, badgeW, 10, 5, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...white);
    doc.text(badgeText, 14 + 7, afterTable + 6.5);

    // ── DIVIDER ───────────────────────────────────────────────
    const footerTop = pageH - 30;
    doc.setDrawColor(...indigo);
    doc.setLineWidth(0.5);
    doc.line(14, footerTop, pageW - 14, footerTop);

    // ── FOOTER ────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text('Thank you for your business!', 14, footerTop + 8);
    doc.text('yourcompany@email.com  |  +91 98765 43210  |  www.yourcompany.com', 14, footerTop + 15);

    // Page number
    doc.setFontSize(7.5);
    const pgText = 'Page 1 of 1';
    doc.text(pgText, pageW - 14 - doc.getTextWidth(pgText), footerTop + 8);

    doc.save(`invoice_${invNum}.pdf`);
  };

  // ── HELPERS ────────────────────────────────────────────────
  function formatINR(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getDueDate() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── UI ─────────────────────────────────────────────────────
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
