require('dotenv').config();
const prisma = require('../src/config/prisma');

let isConnected = false;
let user, business, service;
let dbPromise = null;

async function connectAndFetchData() {
  if (!isConnected) {
    isConnected = true;
    user = await prisma.user.findFirst({ where: { role: 'customer' } });
    service = await prisma.service.findFirst();
    if (service) {
        business = await prisma.business.findUnique({ where: { id: service.businessId } });
    }
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
    context.vars.businessId = business.id.toString();
    context.vars.serviceId = service.id.toString();
    
    return;
  } catch (error) {
    console.error("Error in setupTestData:", error);
    throw error;
  }
}

module.exports = {
  setupTestData
};
