const Order = require('../models/Order');
const socket = require('../socket');

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' ya 'rejected' frontend se aayega

  try {
    // 1. Database Update
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 2. Real-time Notification (Customer ko batao)
    const io = socket.getIO();
    
    // 🔥 FIX: Emit 'order:update' event (matching frontend listener)
    // Send to both room formats for robustness
    io.to(`table_${order.tableNumber}`).emit('order:update', order);
    io.to(order.tableNumber.toString()).emit('order:update', order);

    // Admin Dashboard ko bhi update bhejo (Sync ke liye)
    io.to('admin').emit('order:update', order);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};