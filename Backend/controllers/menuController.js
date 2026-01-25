const MenuItem = require("../models/MenuItem");
const socket = require("../socket");

exports.getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl, description, isBestseller } =
      req.body;
    const newItem = new MenuItem({
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
    res.status(500).json({ message: "Failed to add item" });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true },
    );

    if (!updatedItem)
      return res.status(404).json({ message: "Item not found" });

    const io = socket.getIO();
    io.emit("menu:update", updatedItem);

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const io = socket.getIO();
    io.emit("menu:delete", deletedItem._id);

    res.json({ message: "Item deleted successfully", id: deletedItem._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, imageUrl, description, isBestseller } =
      req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
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
    console.error(error);
    res.status(500).json({ message: "Failed to update item" });
  }
};
