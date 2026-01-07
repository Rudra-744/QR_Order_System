const MenuItem = require('../models/MenuItem');
const socket = require('../socket'); // Socket import

// 1. Get All Menu Items
exports.getMenu = async (req, res) => {
  try {
    const menu = await MenuItem.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Add New Item (Ye missing tha, isliye crash hua)
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;
    const newItem = new MenuItem({ name, price, category, image, description });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item' });
  }
};

// 3. Update Availability (Toggle ON/OFF)
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id, 
      { isAvailable }, 
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

    // Real-time update for customers
    const io = socket.getIO();
    io.emit('menu:update', updatedItem); 

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};