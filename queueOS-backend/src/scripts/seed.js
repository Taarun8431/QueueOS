require('dotenv').config();
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function seedData() {
    try {
        console.log("ℹ Connecting to PostgreSQL via Prisma...");
        await prisma.$connect();
        console.log("✔ Connected successfully.");

        console.log("ℹ Wiping old mock data...");
        // We only delete customers and tokens to preserve your business/staff accounts
        await prisma.user.deleteMany({ where: { role: "customer" } });
        await prisma.token.deleteMany({});
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
        const insertedCustomers = await prisma.user.createMany({
            data: customersToInsert,
            skipDuplicates: true
        });
        console.log(`✔ Inserted ${insertedCustomers.count} customers.`);

        // Need to fetch created customers to get their IDs
        const dbCustomers = await prisma.user.findMany({
            where: { role: "customer" },
            take: 1000
        });

        // Fetch an existing business and service to link the tokens to
        const business = await prisma.business.findFirst();
        const service = await prisma.service.findFirst();

        if (!business || !service) {
            console.error("❌ No business or service found in the database. Please run the E2E tests first or create a business manually.");
            process.exit(1);
        }

        console.log(`ℹ Generating 500 historical tokens for Business: ${business.businessName}`);
        
        const tokensToInsert = [];
        
        // Create 490 completed/cancelled tokens for historical analytics
        for (let i = 0; i < 490; i++) {
            const randomCustomer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
            const statusOptions = ["served", "cancelled", "no_show"];
            
            tokensToInsert.push({
                customerId: randomCustomer.id,
                businessId: business.id,
                serviceId: service.id,
                tokenNumber: `C-${i + 1}`,
                tokenSequence: i + 1,
                status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
                createdAt: faker.date.recent({ days: 30 }) // Spread over the last 30 days
            });
        }

        // Create 10 active tokens currently waiting in the queue
        for (let i = 490; i < 500; i++) {
            const randomCustomer = dbCustomers[Math.floor(Math.random() * dbCustomers.length)];
            
            tokensToInsert.push({
                customerId: randomCustomer.id,
                businessId: business.id,
                serviceId: service.id,
                tokenNumber: `C-${i + 1}`,
                tokenSequence: i + 1,
                status: "waiting",
                createdAt: new Date() // Just joined
            });
        }

        const insertedTokens = await prisma.token.createMany({
            data: tokensToInsert
        });
        console.log(`✔ Inserted ${insertedTokens.count} tokens.`);

        console.log("\n🎉 SEEDING COMPLETE! 🎉");
        console.log("Open your PostgreSQL client and refresh your database.");
        console.log("You will now see 1,000 realistic users and 500 tokens. Take your screenshots!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
