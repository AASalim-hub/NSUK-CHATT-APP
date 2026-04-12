require("dotenv").config({ path: "../.env" });

const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// ✅ SOCKET.IO
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

// Connect DB
connectDB();

const Room = require("./models/Room");

// CREATE DEFAULT ROOMS (RUN ONCE)
async function createRooms() {
  const rooms = [
    { name: "NSUK-GENERAL", admins: ["ahmed123", "john123"] },
    { name: "FACULTY-Engineering", admins: ["engadmin1", "engadmin2"] },
    { name: "FACULTY-Law", admins: ["lawadmin1", "lawadmin2"] },
    { name: "DEPT-Computer Science", admins: ["csadmin1", "csadmin2"] }
  ];

  for (let r of rooms) {
    const exists = await Room.findOne({ name: r.name });
    if (!exists) {
      await Room.create(r);
      console.log("Created room:", r.name);
    }
  }
}

createRooms();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
const updateRoute = require("./routes/update");
app.use("/api/auth/update", updateRoute);

const profileRoute = require("./routes/profile");
app.use("/api/profile", profileRoute);

// ✅ FILE UPLOAD ROUTE
const uploadRoute = require("./routes/upload");
app.use("/api/upload", uploadRoute);

// ✅ SERVE UPLOADED FILES
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// ✅ ADMIN SYSTEM

// ✅ CHAT LOCK STATE
const roomLocks = {};

// ✅ SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM + LOAD OLD MESSAGES
  socket.on("joinRoom", async (room) => {
    try {
      socket.join(room);

      const messages = await Message.find({ room }).sort({ time: 1 });

      socket.emit("oldMessages", messages);
    } catch (err) {
      console.log("ERROR LOADING MESSAGES:", err);
    }
  });

  // SEND MESSAGE / FILE
  socket.on("sendMessage", async (data) => {
    try {
      const roomData = await Room.findOne({ name: data.room });
const admins = roomData ? roomData.admins : [];

const isAdmin = admins.includes(data.sender);

      const isLocked = roomLocks[data.room];

      // BLOCK NON-ADMIN IF LOCKED
      if (isLocked && !isAdmin) {
        socket.emit("message", {
          sender: "SYSTEM",
          text: "Chat is locked. Only admins can send messages.",
          isAdmin: true
        });
        return;
      }

      // ✅ SAFE FLAGS
      data.isAdmin = isAdmin;
      data.isFile = data.isFile || false;

      // ✅ SAVE TO DATABASE
      const User = require("./models/User"); // MUST be at top

const userData = await User.findOne({ username: data.sender });

const savedMsg = await Message.create({
  room: data.room,
  sender: data.sender,
  text: data.text,
  isAdmin: data.isAdmin,
  isFile: data.isFile,
  profilePic: userData ? userData.profilePic : ""
});

// ✅ send saved message with time
io.to(data.room).emit("message", savedMsg);
return;

    } catch (err) {
      console.log("ERROR SENDING MESSAGE:", err);

      socket.emit("message", {
        sender: "SYSTEM",
        text: "Error sending message",
        isAdmin: true
      });
    }
  });

  // LOCK CHAT
  socket.on("lockRoom", (room) => {
    roomLocks[room] = true;

    io.to(room).emit("message", {
      sender: "SYSTEM",
      text: "Chat has been locked by admin",
      isAdmin: true
    });
  });

  // UNLOCK CHAT
  socket.on("unlockRoom", (room) => {
    roomLocks[room] = false;

    io.to(room).emit("message", {
      sender: "SYSTEM",
      text: "Chat has been unlocked by admin",
      isAdmin: true
    });
  });
  
  socket.on("checkAdmin", async (data) => {
  const roomData = await Room.findOne({ name: data.room });

  const admins = roomData ? roomData.admins : [];

  const isAdmin = admins.includes(data.username);

  socket.emit("adminStatus", isAdmin);
});

// ADD ADMIN
socket.on("addAdmin", async (data) => {
  const room = await Room.findOne({ name: data.room });

  if (!room) return;

  if (!room.admins.includes(data.username)) {
    room.admins.push(data.username);
    await room.save();

    io.to(data.room).emit("message", {
      sender: "SYSTEM",
      text: `${data.username} is now an admin`,
      isAdmin: true
    });
  }
});

// REMOVE ADMIN
socket.on("removeAdmin", async (data) => {
  const room = await Room.findOne({ name: data.room });

  if (!room) return;

  room.admins = room.admins.filter(u => u !== data.username);
  await room.save();

  io.to(data.room).emit("message", {
    sender: "SYSTEM",
    text: `${data.username} removed from admin`,
    isAdmin: true
  });
});

});

// Start server
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
