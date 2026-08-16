const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config/jwt");
const User = require("./models/User");

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
      // Requires JWT authentication — only allows joining the restaurant
      // that belongs to the authenticated user.
      socket.on("join_restaurant", async (restaurantId) => {
        if (!restaurantId) return;

        // Extract token from handshake auth or query
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
          socket.emit("error", { message: "Authentication required to join restaurant room" });
          return;
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const user = await User.findById(decoded.id).select("restaurantId");

          if (!user) {
            socket.emit("error", { message: "User not found" });
            return;
          }

          // Authorize: user can only join their OWN restaurant room
          if (user.restaurantId.toString() !== restaurantId.toString()) {
            socket.emit("error", { message: "Not authorized for this restaurant" });
            return;
          }

          const roomName = `restaurant_${restaurantId}`;
          socket.join(roomName);
          console.log(`Socket joined room: ${roomName}`);
        } catch (err) {
          socket.emit("error", { message: "Invalid or expired token" });
        }
      });

      // Customer joins table specific room for a restaurant
      // Customers don't need JWT — they are unauthenticated users scanning QR codes.
      // But we validate that the restaurantId is provided.
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
