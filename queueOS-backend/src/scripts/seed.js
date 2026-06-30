require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');
const Business = require('../models/business.model');
const Service = require('../models/services.model');
const Token = require('../models/token.model');

async function seedData() {
    try {
        console.log("ℹ Connecting to MongoDB...");
        // Fallback to localhost if env var is missing during script run
        await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/queueOS");
        console.log("✔ Connected successfully.");

        console.log("ℹ Wiping old mock data...");
        // We only delete customers and tokens to preserve your business/staff accounts
        await User.deleteMany({ role: "customer" });
        await Token.deleteMany({});
        console.log("✔ Old data wiped.");

        console.log("ℹ Generating 1,000 realistic customers... (This might take a few seconds)");
        
        const passwordHash = await bcrypt.hash("password123", 10);
        const customersToInsert = [];

        for (let i = 0; i < 1000; i++) {
            customersToInsert.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: passwordHash,
                role: "customer",
                phone: faker.phone.number(),
                createdAt: faker.date.past({ years: 1 })
            });
        }
        
        // Insert all customers at once for speed
        const insertedCustomers = await User.insertMany(customersToInsert);
        console.log(`✔ Inserted ${insertedCustomers.length} customers.`);

        // Fetch an existing business and service to link the tokens to
        const business = await Business.findOne();
        const service = await Service.findOne();

        if (!business || !service) {
            console.error("❌ No business or service found in the database. Please run the E2E tests first or create a business manually.");
            process.exit(1);
        }

        console.log(`ℹ Generating 500 historical tokens for Business: ${business.businessName}`);
        
        const tokensToInsert = [];
        
        // Create 490 completed/cancelled tokens for historical analytics
        for (let i = 0; i < 490; i++) {
            const randomCustomer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
            const statusOptions = ["served", "cancelled", "no_show"];
            
            tokensToInsert.push({
                customerId: randomCustomer._id,
                businessId: business._id,
                serviceId: service._id,
                tokenNumber: `C-${i + 1}`,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
                createdAt: faker.date.recent({ days: 30 }) // Spread over the last 30 days
            });
        }

        // Create 10 active tokens currently waiting in the queue
        for (let i = 490; i < 500; i++) {
            const randomCustomer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
            
            tokensToInsert.push({
                customerId: randomCustomer._id,
                businessId: business._id,
                serviceId: service._id,
                tokenNumber: `C-${i + 1}`,
                status: "waiting",
                createdAt: new Date() // Just joined
            });
        }

        await Token.insertMany(tokensToInsert);
        console.log(`✔ Inserted ${tokensToInsert.length} tokens.`);

        console.log("\n🎉 SEEDING COMPLETE! 🎉");
        console.log("Open MongoDB Compass and refresh your database.");
        console.log("You will now see 1,000 realistic users and 500 tokens. Take your screenshots!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedData();
