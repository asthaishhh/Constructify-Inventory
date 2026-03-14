// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, Download, Trash2, Edit, X, Search } from 'lucide-react';
// import jsPDF from 'jspdf';
// import "jspdf-autotable";
// import logoImage from "../../assets/logo.png"; // Ensure you have a logo image in this path
// import { renderToStaticMarkup } from "react-dom/server";


// // UI Components
// function Card({ children, className = "" }) {
//   return <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>{children}</div>;
// }

// function CardHeader({ children, className = "" }) {
//   return <div className={`border-b pb-3 mb-4 ${className}`}>{children}</div>;
// }

// function CardTitle({ children, className = "" }) {
//   return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
// }

// function CardContent({ children, className = "" }) {
//   return <div className={className}>{children}</div>;
// }

// function Button({ children, onClick, className = "", variant = "default", size = "default", disabled = false }) {
//   const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
//   const variants = {
//     default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
//     outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
//     destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
//     ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
//   };
//   const sizes = {
//     default: "px-4 py-2 text-sm",
//     sm: "px-3 py-1.5 text-xs"
//   };
//   const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// function Input({ placeholder, value, onChange, className = "", type = "text", min, disabled = false }) {
//   return (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       min={min}
//       disabled={disabled}
//       className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
//     />
//   );
// }

// function Select({ children, value, onValueChange }) {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onValueChange(e.target.value)}
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
//     >
//       {children}
//     </select>
//   );
// }

// function SelectItem({ value, children }) {
//   return <option value={value}>{children}</option>;
// }

// // Main Component
// export default function InvoiceGenerator() {
//   const [invoices, setInvoices] = useState([]);
//   const [form, setForm] = useState({ 
//     id: null, 
//     client: '', 
//     status: 'pending', 
//     materials: [{ name: '', quantity: 1, rate: 0 }] 
//   });
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');
//   const [showForm, setShowForm] = useState(false);

//   // Calculate total from materials
//   const totalAmount = form.materials.reduce(
//     (acc, item) => acc + (item.quantity * item.rate),
//     0
//   );

//   // Material handlers
//   const addMaterial = () => {
//     setForm({
//       ...form,
//       materials: [...form.materials, { name: '', quantity: 1, rate: 0 }]
//     });
//   };

//   const removeMaterial = (index) => {
//     if (form.materials.length > 1) {
//       setForm({
//         ...form,
//         materials: form.materials.filter((_, i) => i !== index)
//       });
//     }
//   };

//   const updateMaterial = (index, field, value) => {
//     const updated = [...form.materials];
//     updated[index][field] = field === 'name' ? value : Number(value) || 0;
//     setForm({ ...form, materials: updated });
//   };

//   // Form validation
//   const isFormValid = () => {
//     if (!form.client.trim()) return false;
//     if (form.materials.length === 0) return false;
//     return form.materials.every(m => m.name.trim() && m.quantity > 0 && m.rate >= 0);
//   };

//   // CRUD operations
//   const handleSubmit = () => {
//     if (!isFormValid()) {
//       alert('Please fill in all required fields correctly');
//       return;
//     }

//     const invoiceData = {
//       ...form,
//       amount: totalAmount,
//       date: new Date().toLocaleDateString()
//     };

//     if (form.id) {
//       setInvoices(invoices.map(inv => (inv.id === form.id ? invoiceData : inv)));
//     } else {
//       setInvoices([...invoices, { ...invoiceData, id: Date.now() }]);
//     }
    
//     resetForm();
//   };

//   const resetForm = () => {
//     setForm({ 
//       id: null, 
//       client: '', 
//       status: 'pending', 
//       materials: [{ name: '', quantity: 1, rate: 0 }] 
//     });
//     setShowForm(false);
//   };

//   const handleEdit = (invoice) => {
//     setForm(invoice);
//     setShowForm(true);
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       setInvoices(invoices.filter(inv => inv.id !== id));
//     }
//   };

//   // Filter invoices
//   const filteredInvoices = invoices.filter((inv) => {
//     const matchesFilter = filter === 'all' || inv.status === filter;
//     const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   // Generate PDF (as text file)
// //   const generatePDF = (invoice) => {
// //     const content = `
// // INVOICE
// // =======

// // Client: ${invoice.client}
// // Date: ${invoice.date}
// // Status: ${invoice.status.toUpperCase()}

// // MATERIALS
// // ---------
// // ${invoice.materials.map((m, i) => 
// //   `${i + 1}. ${m.name} - Qty: ${m.quantity} × ₹${m.rate} = ₹${m.quantity * m.rate}`
// // ).join('\n')}

// // TOTAL: ₹${invoice.amount.toFixed(2)}
// //     `.trim();

// //     const blob = new Blob([content], { type: 'text/plain' });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = `invoice_${invoice.client}_${invoice.id}.txt`;
// //     a.click();
// //     URL.revokeObjectURL(url);
// //   };

// // chat gpt



// const generatePDF = (invoice) => {
//   const doc = new jsPDF();
//   // ===== Add PNG Logo =====

//  try {
//     doc.addImage(logoImage, "PNG", 15, 10, 25, 25);
//   } catch (error) {
//     console.log("Logo not available, skipping...");
//   }

//   // ===== HEADER =====
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(22);
//   doc.text("INVOICE", 105, 25, { align: "center" });

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(12);
//   doc.text(`Client: ${invoice.client}`, 20, 45);
//   doc.text(`Date: ${invoice.date}`, 20, 53);
//   doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 61);

//   // ===== TABLE =====
//   const tableData = invoice.materials.map((item, index) => [
//     index + 1,
//     item.name,
//     item.quantity,
//     `₹${item.rate}`,
//     `₹${(item.quantity * item.rate).toFixed(2)}`,
//   ]);

//   doc.autoTable({
//     startY: 70,
//     head: [["#", "Material", "Quantity", "Rate", "Amount"]],
//     body: tableData,
//     theme: "grid",
//     styles: { fontSize: 11, cellPadding: 4 },
//     headStyles: { 
//       fillColor: [63, 81, 181], 
//       textColor: [255, 255, 255], 
//       fontStyle: "bold" 
//     },
//     columnStyles: {
//       0: { cellWidth: 10 },
//       1: { cellWidth: 60 },
//       2: { cellWidth: 25, halign: "center" },
//       3: { cellWidth: 30, halign: "right" },
//       4: { cellWidth: 30, halign: "right" },
//     },
//   });

//   // ===== TOTAL =====
//   const finalY = doc.lastAutoTable.finalY + 15;
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(14);
//   doc.text("Total Amount:", 130, finalY);
//   doc.setTextColor(63, 81, 181);
//   doc.text(`₹${invoice.amount.toFixed(2)}`, 170, finalY, { align: "right" });
//   doc.setTextColor(0, 0, 0);

//   // ===== FOOTER =====
//   doc.setFontSize(10);
//   doc.setFont("helvetica", "italic");
//   doc.text("Thank you for your business!", 105, 285, { align: "center" });
//   doc.text("Generated by Invoice Generator App", 105, 292, { align: "center" });

//   // ===== SAVE PDF =====
//   const safeClient = invoice.client.replace(/\s+/g, "_");
//   doc.save(`invoice_${safeClient}_${invoice.id}.pdf`);
// };

//   return (
//     <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
//       {/* Header Card */}
//       <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Invoice Generator
//             </CardTitle>
//             <Button 
//               onClick={() => setShowForm(!showForm)} 
//               className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
//             >
//               <Plus size={18} className="mr-2" />
//               {showForm ? 'Cancel' : 'New Invoice'}
//             </Button>
//           </div>
//         </CardHeader>

//         {/* Search & Filter */}
//         <CardContent className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <Input 
//                 placeholder="Search client..." 
//                 value={search} 
//                 onChange={(e) => setSearch(e.target.value)} 
//                 className="pl-10"
//               />
//             </div>
//             <Select value={filter} onValueChange={setFilter}>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="paid">Paid</SelectItem>
//               {/* <SelectItem value="completed">Completed</SelectItem> */}
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Form Card */}
//       <AnimatePresence>
//         {showForm && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="text-xl font-semibold text-gray-700">
//                   {form.id ? 'Edit Invoice' : 'Create New Invoice'}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Client & Status */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
//                     <Input 
//                       placeholder="Enter client name" 
//                       value={form.client} 
//                       onChange={(e) => setForm({ ...form, client: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                     <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       {/* <SelectItem value="completed">Completed</SelectItem> */}
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Materials Section */}
//                 <div>
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="block text-sm font-medium text-gray-700">Materials *</label>
//                     <Button onClick={addMaterial} size="sm" variant="outline">
//                       <Plus size={16} className="mr-1" />
//                       Add Item
//                     </Button>
//                   </div>

//                   <div className="space-y-3">
//                     {form.materials.map((material, index) => (
//                       <motion.div 
//                         key={index}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
//                       >
//                        <div className="col-span-12 sm:col-span-5">
//                           <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
//                           <select
//                             value={material.name}
//                             onChange={(e) => updateMaterial(index, 'name', e.target.value)}
//                             className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
//                           >
//                             <option value="">Select Material</option>
//                             <option value="Sand">Sand</option>
//                             <option value="Steel Rods">Steel Rods</option>
//                             <option value="Cement">Cement</option>
//                             <option value="Bricks">Bricks</option>
//                           </select>
//                         </div>

//                         <label> Qty
//                           <Input
//                           type="number"
//                           placeholder="Qty"
//                           value={material.quantity}
//                           onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
//                           className="col-span-5 sm:col-span-3"
//                           min="1"
//                         />
//                         </label>
//                         <label> Rate
//                           <Input
//                           type="number"
//                           placeholder="Rate"
//                           value={material.rate}
//                           onChange={(e) => updateMaterial(index, 'rate', e.target.value)}
//                           className="col-span-5 sm:col-span-3"
//                           min="0"
//                         />
//                         </label>
//                         <Button
//                           onClick={() => removeMaterial(index)}
//                           size="sm"
//                           variant="ghost"
//                           className="col-span-2 sm:col-span-1"
//                           disabled={form.materials.length === 1}
//                         >
//                           <X size={16} />
//                         </Button>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Total */}
//                 <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
//                   <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
//                   <span className="text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <Button 
//                     onClick={handleSubmit} 
//                     className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
//                     disabled={!isFormValid()}
//                   >
//                     {form.id ? 'Update Invoice' : 'Create Invoice'}
//                   </Button>
//                   <Button onClick={resetForm} variant="outline" className="flex-1">
//                     Cancel
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Invoice List */}
//       <div className="space-y-4">
//         {filteredInvoices.length === 0 ? (
//           <Card className="shadow-md border-none bg-white/80">
//             <CardContent className="py-12 text-center">
//               <p className="text-gray-500 text-lg">No invoices found. Create your first invoice!</p>
//             </CardContent>
//           </Card>
//         ) : (
//           filteredInvoices.map(inv => (
//             <motion.div
//               key={inv.id}
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               layout
//             >
//               <Card className="shadow-md hover:shadow-xl transition-all border-none bg-white/90 backdrop-blur-sm">
//                 <CardContent className="p-4">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-xl font-bold text-gray-800">{inv.client}</h3>
//                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
//                           inv.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
//                           'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {inv.status.toUpperCase()}
//                         </span>
//                       </div>
//                       <p className="text-2xl font-bold text-indigo-600 mb-1">₹{inv.amount.toFixed(2)}</p>
//                       <p className="text-sm text-gray-500">{inv.date} • {inv.materials.length} item(s)</p>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button size="sm" variant="outline" onClick={() => generatePDF(inv)}>
//                         <Download size={16} />
//                       </Button>
//                       <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}>
//                         <Edit size={16} />
//                       </Button>
//                       <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}>
//                         <Trash2 size={16} />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }


// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import logoImage from "../../assets/logo.png"; // Ensure you have a logo image in this path
// import { renderToStaticMarkup } from "react-dom/server";
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, Download, Trash2, Edit, X, Search } from 'lucide-react';

// // UI Components
// function Card({ children, className = "" }) {
//   return <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>{children}</div>;
// }

// function CardHeader({ children, className = "" }) {
//   return <div className={`border-b pb-3 mb-4 ${className}`}>{children}</div>;
// }

// function CardTitle({ children, className = "" }) {
//   return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
// }

// function CardContent({ children, className = "" }) {
//   return <div className={className}>{children}</div>;
// }

// function Button({ children, onClick, className = "", variant = "default", size = "default", disabled = false }) {
//   const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
//   const variants = {
//     default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
//     outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
//     destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
//     ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
//   };
//   const sizes = {
//     default: "px-4 py-2 text-sm",
//     sm: "px-3 py-1.5 text-xs"
//   };
//   const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
//     >
//       {children}
//     </button>
//   );
// }

// function Input({ placeholder, value, onChange, className = "", type = "text", min, disabled = false }) {
//   return (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       min={min}
//       disabled={disabled}
//       className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
//     />
//   );
// }

// function Select({ children, value, onValueChange }) {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onValueChange(e.target.value)}
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
//     >
//       {children}
//     </select>
//   );
// }

// function SelectItem({ value, children }) {
//   return <option value={value}>{children}</option>;
// }

// // Main Component
// export default function InvoiceGenerator() {
//   const [invoices, setInvoices] = useState([]);
//   const [form, setForm] = useState({ 
//     id: null, 
//     client: '', 
//     status: 'pending', 
//     materials: [{ name: '', quantity: 1, rate: 0 }] 
//   });
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');
//   const [showForm, setShowForm] = useState(false);
//   const [generatingPDF, setGeneratingPDF] = useState(null);

//   // Calculate total from materials
//   const totalAmount = form.materials.reduce(
//     (acc, item) => acc + (item.quantity * item.rate),
//     0
//   );

//   // Material handlers
//   const addMaterial = () => {
//     setForm({
//       ...form,
//       materials: [...form.materials, { name: '', quantity: 1, rate: 0 }]
//     });
//   };

//   const removeMaterial = (index) => {
//     if (form.materials.length > 1) {
//       setForm({
//         ...form,
//         materials: form.materials.filter((_, i) => i !== index)
//       });
//     }
//   };

//   const updateMaterial = (index, field, value) => {
//     const updated = [...form.materials];
//     updated[index][field] = field === 'name' ? value : Number(value) || 0;
//     setForm({ ...form, materials: updated });
//   };

//   // Form validation
//   const isFormValid = () => {
//     if (!form.client.trim()) return false;
//     if (form.materials.length === 0) return false;
//     return form.materials.every(m => m.name.trim() && m.quantity > 0 && m.rate >= 0);
//   };

//   // CRUD operations
//   const handleSubmit = () => {
//     if (!isFormValid()) {
//       alert('Please fill in all required fields correctly');
//       return;
//     }

//     const invoiceData = {
//       ...form,
//       amount: totalAmount,
//       date: new Date().toLocaleDateString()
//     };

//     if (form.id) {
//       setInvoices(invoices.map(inv => (inv.id === form.id ? invoiceData : inv)));
//     } else {
//       setInvoices([...invoices, { ...invoiceData, id: Date.now() }]);
//     }
    
//     resetForm();
//   };

//   const resetForm = () => {
//     setForm({ 
//       id: null, 
//       client: '', 
//       status: 'pending', 
//       materials: [{ name: '', quantity: 1, rate: 0 }] 
//     });
//     setShowForm(false);
//   };

//   const handleEdit = (invoice) => {
//     setForm(invoice);
//     setShowForm(true);
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this invoice?')) {
//       setInvoices(invoices.filter(inv => inv.id !== id));
//     }
//   };

  
//   // Filter invoices
//   const filteredInvoices = invoices.filter((inv) => {
//     const matchesFilter = filter === 'all' || inv.status === filter;
//     const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

  
// // Put this inside your component (replace existing generatePDF)
// const generatePDF = async (invoice) => {
//   // Activate spinner for this invoice
//   setGeneratingPDF(invoice.id);

//   // Helper: load image URL into dataURL (returns null on failure)
//   const loadImageAsDataURL = (src) => {
//     return new Promise((resolve) => {
//       if (!src) return resolve(null);
//       const img = new Image();
//       img.crossOrigin = "Anonymous";
//       img.onload = () => {
//         try {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.naturalWidth;
//           canvas.height = img.naturalHeight;
//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0);
//           const dataURL = canvas.toDataURL("image/png");
//           resolve(dataURL);
//         } catch (err) {
//           console.warn("Failed to convert logo to dataURL:", err);
//           resolve(null);
//         }
//       };
//       img.onerror = (err) => {
//         console.warn("Logo load error:", err);
//         resolve(null);
//       };
//       img.src = src;
//       // If cached and already complete, try to trigger onload
//       if (img.complete) {
//         // small timeout to ensure canvas works
//         setTimeout(() => {
//           try { 
//             const canvas = document.createElement("canvas");
//             canvas.width = img.naturalWidth;
//             canvas.height = img.naturalHeight;
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0);
//             resolve(canvas.toDataURL("image/png"));
//           } catch (e) { resolve(null); }
//         }, 50);
//       }
//     });
//   };

//   try {
//     const doc = new jsPDF();

//     // Try to load logo (logoImage may be a URL string from bundler)
//     const logoDataUrl = await loadImageAsDataURL(logoImage).catch(() => null);
//     if (logoDataUrl) {
//       try {
//         doc.addImage(logoDataUrl, "PNG", 15, 10, 25, 25);
//       } catch (err) {
//         console.warn("doc.addImage failed with dataURL, skipping logo:", err);
//       }
//     } else {
//       // if load failed, skip logo (we don't throw)
//       console.info("No valid logo found — continuing without it.");
//     }

//     // Header
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(22);
//     doc.text("INVOICE", 105, 25, { align: "center" });

//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(12);
//     doc.text(`Client: ${invoice.client || "N/A"}`, 20, 45);
//     doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 20, 53);
//     doc.text(`Status: ${(invoice.status || "pending").toUpperCase()}`, 20, 61);

//     // Ensure amount exists — fallback to recomputing from materials
//     const amount = typeof invoice.amount === "number"
//       ? invoice.amount
//       : (invoice.materials || []).reduce((acc, it) => acc + ((it.quantity || 0) * (it.rate || 0)), 0);

//     const tableData = (invoice.materials || []).map((item, index) => [
//       index + 1,
//       item.name || "-",
//       item.quantity ?? 0,
//       `₹${(item.rate ?? 0)}`,
//       `₹${(((item.quantity ?? 0) * (item.rate ?? 0))).toFixed(2)}`,
//     ]);

//     doc.autoTable({
//       startY: 70,
//       head: [["#", "Material", "Quantity", "Rate", "Amount"]],
//       body: tableData,
//       theme: "grid",
//       styles: { fontSize: 11, cellPadding: 4 },
//       headStyles: {
//         fillColor: [63, 81, 181],
//         textColor: [255, 255, 255],
//         fontStyle: "bold",
//       },
//       columnStyles: {
//         0: { cellWidth: 10 },
//         1: { cellWidth: 60 },
//         2: { cellWidth: 25, halign: "center" },
//         3: { cellWidth: 30, halign: "right" },
//         4: { cellWidth: 30, halign: "right" },
//       },
//     });

//     // Total
//     const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 160;
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(14);
//     doc.text("Total Amount:", 130, finalY);
//     doc.setTextColor(63, 81, 181);
//     doc.text(`₹${amount.toFixed(2)}`, 170, finalY, { align: "right" });
//     doc.setTextColor(0, 0, 0);

//     // Footer
//     doc.setFontSize(10);
//     doc.setFont("helvetica", "italic");
//     doc.text("Thank you for your business!", 105, 285, { align: "center" });
//     doc.text("Generated by Invoice Generator App", 105, 292, { align: "center" });

//     // Save (trigger browser download)
//     const safeClient = (invoice.client || "client").replace(/\s+/g, "_");
//     const fileName = `invoice_${safeClient}_${invoice.id ?? Date.now()}.pdf`;
//     doc.save(fileName);

//   } catch (err) {
//     console.error("Error generating PDF:", err);
//     // Inform user so they know something failed
//     alert("Failed to generate PDF. Check console for details.");
//   } finally {
//     // clear spinner immediately so user can retry; keep small delay if you prefer UX
//     setGeneratingPDF(null);
//   }
// };

//   // Generate and Download PDF


//   return (
//     <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
//       {/* Header Card */}
//       <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Invoice Generator
//             </CardTitle>
//             <Button 
//               onClick={() => setShowForm(!showForm)} 
//               className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
//             >
//               <Plus size={18} className="mr-2" />
//               {showForm ? 'Cancel' : 'New Invoice'}
//             </Button>
//           </div>
//         </CardHeader>

//         {/* Search & Filter */}
//         <CardContent className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <Input 
//                 placeholder="Search client..." 
//                 value={search} 
//                 onChange={(e) => setSearch(e.target.value)} 
//                 className="pl-10"
//               />
//             </div>
//             <Select value={filter} onValueChange={setFilter}>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="paid">Paid</SelectItem>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Form Card */}
//       <AnimatePresence>
//         {showForm && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
//               <CardHeader>
//                 <CardTitle className="text-xl font-semibold text-gray-700">
//                   {form.id ? 'Edit Invoice' : 'Create New Invoice'}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Client & Status */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
//                     <Input 
//                       placeholder="Enter client name" 
//                       value={form.client} 
//                       onChange={(e) => setForm({ ...form, client: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                     <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Materials Section */}
//                 <div>
//                   <div className="flex justify-between items-center mb-3">
//                     <label className="block text-sm font-medium text-gray-700">Materials *</label>
//                     <Button onClick={addMaterial} size="sm" variant="outline">
//                       <Plus size={16} className="mr-1" />
//                       Add Item
//                     </Button>
//                   </div>

//                   <div className="space-y-3">
//                     {form.materials.map((material, index) => (
//                       <motion.div 
//                         key={index}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
//                       >
//                                                 <div className="col-span-12 sm:col-span-5">
//                           <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
//                           <select
//                             value={material.name}
//                             onChange={(e) => updateMaterial(index, 'name', e.target.value)}
//                             className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
//                           >
//                             <option value="">Select Material</option>
//                             <option value="Sand">Sand</option>
//                             <option value="Steel Rods">Steel Rods</option>
//                             <option value="Cement">Cement</option>
//                             <option value="Bricks">Bricks</option>
//                           </select>
//                         </div>

//                         <label> Qty
//                           <Input
//                           type="number"
//                           placeholder="Qty"
//                           value={material.quantity}
//                           onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
//                           className="col-span-5 sm:col-span-3"
//                           min="1"
//                         />
//                         </label>
//                        <label> Rate
//                          <Input
//                           type="number"
//                           placeholder="Rate"
//                           value={material.rate}
//                           onChange={(e) => updateMaterial(index, 'rate', e.target.value)}
//                           className="col-span-5 sm:col-span-3"
//                           min="0"
//                         />
//                        </label>
//                         <Button
//                           onClick={() => removeMaterial(index)}
//                           size="sm"
//                           variant="ghost"
//                           className="col-span-2 sm:col-span-1"
//                           disabled={form.materials.length === 1}
//                         >
//                           <X size={16} />
//                         </Button>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Total */}
//                 <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
//                   <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
//                   <span className="text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex gap-3">
//                   <Button 
//                     onClick={handleSubmit} 
//                     className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
//                     disabled={!isFormValid()}
//                   >
//                     {form.id ? 'Update Invoice' : 'Create Invoice'}
//                   </Button>
//                   <Button onClick={resetForm} variant="outline" className="flex-1">
//                     Cancel
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Invoice List */}
//       <div className="space-y-4">
//         {filteredInvoices.length === 0 ? (
//           <Card className="shadow-md border-none bg-white/80">
//             <CardContent className="py-12 text-center">
//               <p className="text-gray-500 text-lg">No invoices found. Create your first invoice!</p>
//             </CardContent>
//           </Card>
//         ) : (
//           filteredInvoices.map(inv => (
//             <motion.div
//               key={inv.id}
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               layout
//             >
//               <Card className="shadow-md hover:shadow-xl transition-all border-none bg-white/90 backdrop-blur-sm">
//                 <CardContent className="p-4">
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-2">
//                         <h3 className="text-xl font-bold text-gray-800">{inv.client}</h3>
//                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                           inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
//                           inv.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
//                           'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {inv.status.toUpperCase()}
//                         </span>
//                       </div>
//                       <p className="text-2xl font-bold text-indigo-600 mb-1">₹{inv.amount.toFixed(2)}</p>
//                       <p className="text-sm text-gray-500">{inv.date} • {inv.materials.length} item(s)</p>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button 
//                         size="sm" 
//                         variant="outline" 
//                         onClick={() => generatePDF(inv)}
//                         disabled={generatingPDF === inv.id}
//                         className="relative"
//                       >
//                         {generatingPDF === inv.id ? (
//                           <motion.div
//                             animate={{ rotate: 360 }}
//                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                           >
//                             <Download size={16} />
//                           </motion.div>
//                         ) : (
//                           <Download size={16} />
//                         )}
//                       </Button>
//                       <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}>
//                         <Edit size={16} />
//                       </Button>
//                       <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}>
//                         <Trash2 size={16} />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
