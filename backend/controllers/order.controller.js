import Order from "../models/order.js";
import Material from "../models/Material.js";

const normalizeStatus = (status = "open") => {
  const s = String(status || "open").toLowerCase();
  if (["open", "processing", "executed", "completed", "cancelled", "pending", "received"].includes(s)) return s;
  return "open";
};

const mapOrderForUi = (orderDoc) => {
  const order = orderDoc?.toObject ? orderDoc.toObject() : orderDoc;
  return {
    ...order,
    id: order.id,
    type: order.type || "mine",
    client: order.client,
    materialName: order.materialName,
    quantity: Number(order.quantity || 0),
    costPrice: Number(order.costPrice || 0),
    sellingPrice: Number(order.sellingPrice || 0),
    // Keep legacy price field for existing frontend code paths
    price: Number(order.sellingPrice || 0),
    profitPerUnit: Number(order.profitPerUnit || 0),
    profit: Number(order.profit || 0),
    totalAmount: Number(order.totalAmount || 0),
    status: normalizeStatus(order.status),
    createdAt: order.createdAt,
  };
};

/*
CREATE ORDER
*/
export const createOrder = async (req, res) => {
  try {
    const {
      id,
      type,
      client,
      materialName,
      quantity,
      costPrice,
      status,
    } = req.body;

    if (!id || !client || !materialName || !quantity) {
      return res.status(400).json({ message: "id, client, materialName and quantity are required" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be greater than 0" });
    }

    const material = await Material.findOne({ name: new RegExp(`^${String(materialName).trim()}$`, "i") });
    if (!material) {
      return res.status(404).json({ message: `Material not found: ${materialName}` });
    }

    if (material.quantity < qty) {
      return res.status(400).json({ message: `Insufficient stock for ${material.name}` });
    }

    const cost = Number.isFinite(Number(costPrice)) ? Number(costPrice) : Number(material.price || 0);

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({ message: "costPrice must be a valid number" });
    }

    // Deduct inventory when order is created
    material.quantity -= qty;
    await material.save();

    // Selling price is captured later during invoice generation.
    const totalAmount = Number((qty * cost).toFixed(2));
    const profitPerUnit = 0;
    const profit = 0;

    const newOrder = new Order({
      id,
      type: type === "customers" ? "customers" : "mine",
      client,
      material: material._id,
      materialName: material.name,
      quantity: qty,
      unit: material.unit || "",
      costPrice: cost,
      sellingPrice: 0,
      totalAmount,
      profitPerUnit,
      profit,
      status: normalizeStatus(status),
      createdAt: new Date(),
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: mapOrderForUi(newOrder),
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error creating order" });
  }
};

/*
GET ALL ORDERS
*/
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("material", "name unit")
      .sort({ createdAt: -1 });

    res.status(200).json(orders.map(mapOrderForUi));
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

/*
GET SINGLE ORDER
*/
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("material", "name unit");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(mapOrderForUi(order));
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
};

/*
UPDATE ORDER STATUS
*/
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: normalizeStatus(status) },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order: mapOrderForUi(order),
    });
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Server error updating order" });
  }
};

/*
DELETE ORDER
*/
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ message: "Server error deleting order" });
  }
};