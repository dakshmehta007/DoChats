const express = require("express");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 5000;
const { chats } = require("./data/data");
dotenv.config();
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require("./routes/messageRoutes");
const connectDB = require("./config/db");
const colors = require("colors");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const cors = require("cors");

connectDB();
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: "https://dochats.netlify.app", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent
}));

app.get('/', (req, res) => {
    res.send("Hello Daksh Mehta");
});

// Uncomment these if you have error handling middleware
// app.use(notFound);
// app.use(errorHandler);

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const server = app.listen(PORT, console.log(`Server is running at port : ${PORT}`.yellow.bold));

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });
});
