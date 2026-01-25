const Order = require("../models/Order");
const socket = require("../socket");

exports.getOrders = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type === "active") {
      query = { status: { $in: ["pending", "approved"] } };
    } else if (type === "history") {
      query = { status: { $in: ["completed", "rejected"] } };
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items, totalAmount, note } = req.body;
    const newOrder = new Order({
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      tableNumber,
      items,
      totalAmount,
      note: note || "",
      status: "pending",
    });
    await newOrder.save();

    const io = socket.getIO();
    io.emit("order:new", newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Create Order Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = socket.getIO();
    io.to(order.tableNumber.toString()).emit("order:update", order);
    io.to(`table_${order.tableNumber}`).emit("order:update", order);
    io.to("admin").emit("order:update", order);

    res.json(order);
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Get Order By Id Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
