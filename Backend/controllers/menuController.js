const MenuItem = require("../models/MenuItem");
const socket = require("../socket");

exports.getMenu = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    // req.user is set if accessed via protected admin route, otherwise it's a customer query
    const queryId = req.user ? req.user.restaurantId : restaurantId;
    if (!queryId) return res.status(400).json({ message: "Restaurant ID required" });

    const menu = await MenuItem.find({ restaurantId: queryId });
    res.json(menu);
  } catch (error) {
    console.error("Get Menu Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl, description, isBestseller } =
      req.body;
    const newItem = new MenuItem({
      restaurantId: req.user.restaurantId,
      name,
      price,
      category,
      imageUrl: imageUrl || "",
      description: description || "",
      isBestseller: isBestseller || false,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Add Menu Item Error:", error);
    res
      .status(500)
      .json({ message: "Failed to add item", error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      { isAvailable },
      { new: true },
    );

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });

    const io = socket.getIO();
    io.emit("menu:update", updatedItem);

    res.json(updatedItem);
  } catch (error) {
    console.error("Update Availability Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId: req.user.restaurantId });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const io = socket.getIO();
    io.emit("menu:delete", deletedItem._id);

    res.json({ message: "Item deleted successfully", id: deletedItem._id });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, imageUrl, description, isBestseller } =
      req.body;

    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: req.user.restaurantId },
      { name, price, category, imageUrl, description, isBestseller },
      { new: true },
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const io = socket.getIO();
    io.emit("menu:update", updatedItem);

    res.json(updatedItem);
  } catch (error) {
    console.error("Update Item Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update item", error: error.message });
  }
};
