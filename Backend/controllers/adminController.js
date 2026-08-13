const Order = require("../models/Order");
const socket = require("../socket");

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = socket.getIO();
    io.to(`restaurant_${order.restaurantId}_table_${order.tableNumber}`).emit("order:update", order);
    io.to(`restaurant_${order.restaurantId}`).emit("order:update", order);

    res.json(order);
  } catch (error) {
    console.error("Admin Update Order Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
