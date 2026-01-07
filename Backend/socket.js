const socketIo = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: {
        origin: "*", // 🔥 Frontend ko allow karne ke liye
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {

      // 👇 YE PART MISSING HOGA TERE CODE ME
      socket.on('join_table', (tableNumber) => {
        const roomName1 = `table_${tableNumber}`;
        const roomName2 = tableNumber.toString();
        
        socket.join(roomName1);
        socket.join(roomName2);
      });

      socket.on('disconnect', () => {
        // Client disconnected
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};