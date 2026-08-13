const socketIo = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      // Restaurant owner joins their restaurant room
      socket.on("join_restaurant", (restaurantId) => {
        if (!restaurantId) return;
        const roomName = `restaurant_${restaurantId}`;
        socket.join(roomName);
        console.log(`Socket joined room: ${roomName}`);
      });

      // Customer joins table specific room for a restaurant
      socket.on("join_table_restaurant", ({ restaurantId, tableNumber }) => {
        if (!restaurantId || !tableNumber) return;
        const roomName = `restaurant_${restaurantId}_table_${tableNumber}`;
        socket.join(roomName);
        console.log(`Socket joined room: ${roomName}`);
      });

      socket.on("disconnect", () => {});
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
