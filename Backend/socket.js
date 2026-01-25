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
      socket.on("join_table", (tableNumber) => {
        const roomName1 = `table_${tableNumber}`;
        const roomName2 = tableNumber.toString();

        socket.join(roomName1);
        socket.join(roomName2);
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
