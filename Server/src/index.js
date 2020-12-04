require("./models/User");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middlewares/requireAuth");

const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

server.listen(8000);

app.use(bodyParser.json());
app.use(authRoutes);

const mongoURI =
  "mongodb+srv://Config:S8524567539516g@cluster0.r1ha1.mongodb.net/<dbname>?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to mongoose instance");
});

mongoose.connection.on("error", () => {
  console.log("Error connecting to mongoose");
});

app.get("/", requireAuth, (req, res) => {
  res.send("Hi there");
});

app.listen(3000, () => {
  console.log("Listening to port 3000");
});
