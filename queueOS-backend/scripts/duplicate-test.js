require('dotenv').config();
const axios = require("axios");
const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const Business = require("../src/models/business.model");
const Service = require("../src/models/services.model");

async function runDuplicateTest() {
  await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/queueOS");
  const user = await User.findOne({ role: "customer" });
  const business = await Business.findOne({});
  const service = await Service.findOne({ businessId: business._id });

  if (!user || !business || !service) {
    console.error("Seed data missing.");
    process.exit(1);
  }

  // Login
  let cookie;
  try {
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: user.email,
      password: "password123"
    });
    cookie = loginRes.data.accessToken;
  } catch (error) {
    console.error("Login failed:", error.message);
    process.exit(1);
  }

  console.log("Sending 20 concurrent requests to join the queue...");
  
  const requests = [];
  for (let i = 0; i < 20; i++) {
    requests.push(
      axios.post("http://localhost:5000/api/queue/token", {
        businessId: business._id,
        serviceId: service._id
      }, {
        headers: { Authorization: `Bearer ${cookie}` }
      }).then(res => ({ status: res.status, data: res.data }))
        .catch(err => ({ status: err.response?.status || 500, error: err.message }))
    );
  }

  const results = await Promise.all(requests);
  
  const successes = results.filter(r => r.status === 201);
  const failures = results.filter(r => r.status !== 201);
  
  console.log(`=== Duplicate Request Prevention Metrics ===`);
  console.log(`Total Requests: 20`);
  console.log(`Successful Token Creations: ${successes.length}`);
  console.log(`Failed/Rejected Requests: ${failures.length}`);
  
  if (successes.length > 0) {
    console.log("\nCleaning up created tokens...");
    for (const success of successes) {
      if (success.data && success.data.data && success.data.data._id) {
        await axios.put(`http://localhost:5000/api/queue/cancel/${success.data.data._id}`, {}, {
           headers: { Authorization: `Bearer ${cookie}` }
        }).catch(() => {});
      }
    }
  }
  
  console.log("==========================================");
  process.exit(0);
}

runDuplicateTest();
