import React, { useEffect, useState } from "react";
import customersApi from "../api/customers.api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
    gstNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const isAdmin = role === "admin";

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAllCustomers();
      // route returns array directly
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (!isAdmin) {
          alert("You are not authorized to edit customers.");
          return;
        }
        const updated = await customersApi.updateCustomer(editingId, formData);
        setCustomers((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        setEditingId(null);
      } else {
        await customersApi.createCustomer(formData);
      }
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        companyName: "",
        gstNumber: ""
      });
      fetchCustomers();
    } catch (error) {
      console.error(error);
      setError(error?.message || "Error creating/updating customer");
    }
  };

  const handleEdit = (cust) => {
    setEditingId(cust._id);
    setFormData({
      name: cust.name || "",
      phone: cust.phone || "",
      email: cust.email || "",
      address: cust.address || "",
      companyName: cust.companyName || "",
      gstNumber: cust.gstNumber || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("You are not authorized to delete customers.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await customersApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error deleting customer");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers</h2>
      {loading && <div>Loading customers...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Add Customer Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
        />
        <input
          type="text"
          name="gstNumber"
          placeholder="GST Number"
          value={formData.gstNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />

        <button type="submit">{editingId ? "Update Customer" : "Add Customer"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: "",
                phone: "",
                email: "",
                address: "",
                companyName: "",
                gstNumber: ""
              });
            }}
            style={{ marginLeft: 8 }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Customers Table */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Company</th>
            <th>GST</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust._id}>
              <td>{cust.name}</td>
              <td>{cust.phone}</td>
              <td>{cust.email}</td>
              <td>{cust.companyName}</td>
              <td>{cust.gstNumber}</td>
              <td>{cust.address}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleEdit(cust)} style={{ marginRight: 8 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cust._id)} style={{ color: "red" }}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;