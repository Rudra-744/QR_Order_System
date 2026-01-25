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
    io.to(`table_${order.tableNumber}`).emit("order:update", order);
    io.to(order.tableNumber.toString()).emit("order:update", order);
    io.to("admin").emit("order:update", order);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
