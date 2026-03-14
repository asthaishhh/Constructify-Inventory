import api from "../pages/api";

export const getAllCustomers = async () => {
  const res = await api.get("/api/customers");
  return res.data;
};

export const createCustomer = async (payload) => {
  const res = await api.post("/api/customers", payload);
  return res.data;
};

export const getCustomerById = async (id) => {
  const res = await api.get(`/api/customers/${id}`);
  return res.data;
};

export const updateCustomer = async (id, payload) => {
  const res = await api.put(`/api/customers/${id}`, payload);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/api/customers/${id}`);
  return res.data;
};

export default {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
