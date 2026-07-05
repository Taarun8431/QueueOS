require('dotenv').config();
const { io } = require("socket.io-client");
const axios = require("axios");

// Re-use our connection utility
const { connectAndFetchData } = require("./artillery-processor");
const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const Business = require("../src/models/business.model");
const Service = require("../src/models/services.model");

async function runSyncLatencyTest() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/queueOS");
  const user = await User.findOne({ role: "customer" });
  const business = await Business.findOne({});
  const service = await Service.findOne({ businessId: business._id });

  if (!user || !business || !service) {
    console.error("Seed data missing.");
    process.exit(1);
  }

  // Login to get token cookie
  let cookie;
  try {
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: user.email,
      password: "password123"
    });
    cookie = loginRes.data.accessToken;
  } catch (error) {
    console.error("Login failed. Is server running on 5000?", error.message);
    process.exit(1);
  }

  const socket = io("http://localhost:5000", {
    transports: ["websocket"]
  });

  socket.on("connect", async () => {
    console.log(`Connected to WebSocket. Socket ID: ${socket.id}`);
    
    // Join room
    socket.emit("joinQueueRoom", { businessId: business._id, serviceId: service._id });
    
    // Wait for room join
    await new Promise(res => setTimeout(res, 500));

    console.log("Sending HTTP request to join queue...");
    const startTime = Date.now();
    let httpResolved = false;
    
    axios.post("http://localhost:5000/api/queue/token", {
      businessId: business._id,
      serviceId: service._id
    }, {
      headers: { Authorization: `Bearer ${cookie}` }
    }).then(res => {
      httpResolved = true;
      console.log(`HTTP Request successful in ${Date.now() - startTime}ms`);
      
      // Clean up the token
      axios.put(`http://localhost:5000/api/queue/cancel/${res.data.data._id}`, {}, {
        headers: { Authorization: `Bearer ${cookie}` }
      }).catch(() => {});
    }).catch(err => {
      console.error("HTTP Request failed:", err.message);
    });

    socket.on("queueUpdated", (data) => {
      if (data.event === "tokenJoined") {
        const latency = Date.now() - startTime;
        console.log(`=== Synchronization Latency Metric ===`);
        console.log(`WebSocket event received after: ${latency}ms`);
        console.log(`======================================`);
        
        // Give time for cleanup then exit
        setTimeout(() => {
          socket.disconnect();
          process.exit(0);
        }, 1000);
      }
    });
  });
}

runSyncLatencyTest();
