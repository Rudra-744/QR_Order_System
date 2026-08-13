const Table = require("../models/Table");
const QRCode = require("qrcode");

exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ restaurantId: req.user.restaurantId });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    const newTable = new Table({
      restaurantId: req.user.restaurantId,
      tableNumber,
    });
    await newTable.save();
    res.status(201).json(newTable);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Table number already exists for this restaurant" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findOne({ _id: tableId, restaurantId: req.user.restaurantId });
    
    if (!table) return res.status(404).json({ message: "Table not found" });

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const orderUrl = `${baseUrl}/menu?restaurantId=${req.user.restaurantId}&table=${table.tableNumber}`;

    const qrDataUrl = await QRCode.toDataURL(orderUrl);
    res.json({ qrDataUrl, url: orderUrl });
  } catch (error) {
    res.status(500).json({ message: "Error generating QR code", error: error.message });
  }
};
