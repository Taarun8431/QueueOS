require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Business = require('../src/models/business.model');
const Service = require('../src/models/services.model');

let isConnected = false;
let user, business, service;
let dbPromise = null;

async function connectAndFetchData() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/queueOS");
    isConnected = true;
    user = await User.findOne({ role: 'customer' });
    business = await Business.findOne({});
    service = await Service.findOne({ businessId: business._id });
  }
}

async function setupTestData(context, ee) {
  try {
    if (!dbPromise) {
      dbPromise = connectAndFetchData();
    }
    await dbPromise;

    if (!user || !business || !service) {
      console.error("Missing seed data! Run node src/scripts/seed.js first.");
      process.exit(1);
    }

    context.vars.email = user.email;
    context.vars.password = "password123"; // the seeded password
    context.vars.businessId = business._id.toString();
    context.vars.serviceId = service._id.toString();
    
    return;
  } catch (error) {
    console.error("Error in setupTestData:", error);
    throw error;
  }
}

module.exports = {
  setupTestData
};
