const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const socket = require("../socket");
const asyncHandler = require("../utils/asyncHandler");

// ─── FIX 3: Get orders for admin (protected, own restaurant only) ───────────
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
    Order.countDocuments(query),
  ]);

  res.json({
    data: orders,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  });
});

exports.createOrder = asyncHandler(async (req, res) => {
  const { tableNumber, items, note, restaurantId } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  // FIX 6: Check idempotency key FIRST before any DB reads/writes
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey, restaurantId });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }
  }

  // Validate restaurant exists
  const restaurant = await Restaurant.findById(restaurantId).lean();
  if (!restaurant) {
    res.status(400);
    throw new Error("Restaurant not found");
  }

  // Validate table belongs to this restaurant
  const table = await Table.findOne({
    restaurantId,
    tableNumber: String(tableNumber),
  }).lean();
  if (!table) {
    res.status(400);
    throw new Error("Table not found for this restaurant");
  }

  // Validate items and fetch authoritative prices
  const itemIds = items.map((i) => i.itemId);
  const dbMenuItems = await MenuItem.find({
    _id: { $in: itemIds },
    restaurantId,
  }).lean();

  if (dbMenuItems.length !== itemIds.length) {
    res.status(400);
    throw new Error("One or more menu items are invalid or unavailable");
  }

  // Create a map for quick item lookup
  const itemMap = {};
  dbMenuItems.forEach(item => {
    itemMap[item._id.toString()] = item;
  });

  // Calculate authoritative total Amount and construct validated items array
  let serverTotalAmount = 0;
  const validatedItems = items.map((reqItem) => {
    const dbItem = itemMap[reqItem.itemId.toString()];
    if (!dbItem.isAvailable) {
      res.status(400);
      throw new Error(`Item ${dbItem.name} is currently unavailable`);
    }
    serverTotalAmount += dbItem.price * reqItem.qty;
    return {
      itemId: reqItem.itemId,
      name: dbItem.name,  // Authoritative name
      price: dbItem.price, // Authoritative price
      qty: reqItem.qty,
    };
  });

  // Race-condition-safe idempotency via try/catch on E11000
  try {
    const newOrder = new Order({
      restaurantId,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      tableNumber,
      items: validatedItems,
      totalAmount: serverTotalAmount,
      note: note || "",
      status: "pending",
      idempotencyKey,
    });

    await newOrder.save();

    const io = socket.getIO();
    io.to(`restaurant_${restaurantId}`).emit("order:created", newOrder);

    return res.status(201).json(newOrder);
  } catch (err) {
    // Catch concurrent duplicate idempotency key — return the existing order gracefully
    if (err.code === 11000 && idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey, restaurantId });
      if (existingOrder) {
        return res.status(200).json(existingOrder);
      }
    }
    throw err; // re-throw for the global error handler
  }
});

// ─── FIX 3: Update order status (admin only, own restaurant only) ─────────────
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

// ─── FIX 3: Get single order by ID ─────────────────────────────────────────
// Admins: must own the order's restaurant.
// Customers: can query by their idempotency-key via header for status tracking.
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // If an admin JWT is present, enforce restaurant ownership
  if (req.user) {
    if (order.restaurantId.toString() !== req.user.restaurantId.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this order");
    }
    return res.json(order);
  }

  // Unauthenticated customer — return limited status fields only, no admin notes exposure
  const idempotencyKey = req.headers["idempotency-key"];
  if (!idempotencyKey || order.idempotencyKey !== idempotencyKey) {
    res.status(403);
    throw new Error("Not authorized to access this order");
  }

  res.json({
    _id: order._id,
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    status: order.status,
    items: order.items,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
  });
});
