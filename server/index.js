// ================= IMPORTS =================
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Kafka, Partitioners } = require("kafkajs");

// ================= CONFIG =================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

// ================= APP SETUP =================
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json());

// ================= SERVE FRONTEND =================
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ================= LOGIN ROUTE =================
app.post("/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  const token = jwt.sign(
    { id: Date.now(), username },
    JWT_SECRET
  );

  res.json({ token });
});

// ================= KAFKA SETUP =================
const kafka = new Kafka({
  clientId: "location-app",
  brokers: [KAFKA_BROKER]
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

const consumer = kafka.consumer({ groupId: "socket-group" });

// ================= SOCKET AUTH =================
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// ================= SOCKET CONNECTION =================
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.user.username}`);

  socket.on("location:update", async (data) => {
    const event = {
      userId: socket.user.id,
      username: socket.user.username,
      lat: data.lat,
      lng: data.lng,
      timestamp: Date.now()
    };

    console.log("📤 Sending to Kafka:", event);

    await producer.send({
      topic: "location-updates",
      messages: [{ value: JSON.stringify(event) }]
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });
});

// ================= KAFKA CONSUMER =================
const startKafka = async () => {
  await producer.connect();
  await consumer.connect();

  // Create topic if not exists
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [{ topic: "location-updates", numPartitions: 1 }]
  });
  await admin.disconnect();

  await consumer.subscribe({ topic: "location-updates", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      console.log("📡 Broadcasting:", event);

      io.emit("location:broadcast", event);
    }
  });
};

// ================= START SERVER =================
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await startKafka();
});