const Order = require("../models/Order");
const socket = require("../socket");
const asyncHandler = require("../utils/asyncHandler");

exports.getOrders = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  
  let query = { restaurantId: req.user.restaurantId };
  
  if (type === "active") {
    query.status = { $in: ["pending", "approved", "preparing", "ready"] };
  } else if (type === "history") {
    query.status = { $in: ["completed", "rejected", "cancelled"] };
  }

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const [orders, totalCount] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Order.countDocuments(query)
  ]);

  res.json({
    data: orders,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount
  });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { tableNumber, items, totalAmount, note, restaurantId } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey, restaurantId });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }
  }

  const newOrder = new Order({
    restaurantId,
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    tableNumber,
    items,
    totalAmount,
    note: note || "",
    status: "pending",
    idempotencyKey
  });
  
  await newOrder.save();

  const io = socket.getIO();
  // Emit exclusively to the restaurant's room
  io.to(`restaurant_${restaurantId}`).emit("order:created", newOrder);

  res.status(201).json(newOrder);
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findOneAndUpdate(
    { _id: id, restaurantId: req.user.restaurantId }, 
    { status }, 
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const io = socket.getIO();
  const restaurantRoom = `restaurant_${order.restaurantId}`;
  const tableRoom = `restaurant_${order.restaurantId}_table_${order.tableNumber}`;

  let eventName = "order:update";
  if (status === "approved") eventName = "order:accepted";
  else if (status === "preparing") eventName = "order:preparing";
  else if (status === "ready") eventName = "order:ready";
  else if (status === "completed") eventName = "order:completed";
  else if (status === "rejected" || status === "cancelled") eventName = "order:cancelled";

  io.to(restaurantRoom).emit(eventName, order);
  io.to(tableRoom).emit(eventName, order);

  res.json(order);
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});
