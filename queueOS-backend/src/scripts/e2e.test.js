const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runE2E() {
    console.log("🚀 Starting E2E Tests...");
    let userToken = "";
    
    const dynamicEmail = `owner_${Date.now()}@example.com`;
    try {
        console.log("\n1️⃣ Registering a new business user...");
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            name: "Test Owner",
            email: dynamicEmail,
            password: "password123",
            role: "owner",
            phone: "1234567890"
        });
        console.log("✔ Registration successful");
    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.log("ℹ User already exists, proceeding to login...");
        } else {
            console.error("❌ Registration failed:", err.response ? err.response.data : err.message);
            process.exit(1);
        }
    }

    try {
        console.log("\n2️⃣ Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: dynamicEmail,
            password: "password123"
        });
        userToken = loginRes.data.accessToken;
        console.log("✔ Login successful");
    } catch (err) {
        console.error("❌ Login failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    }

    const headers = { Authorization: `Bearer ${userToken}` };
    let businessId = "";

    try {
        console.log("\n3️⃣ Creating a business...");
        const businessRes = await axios.post(`${API_URL}/business`, {
            businessName: "Test Business " + Date.now(),
            businessEmail: `business_${Date.now()}@test.com`,
            description: "A business created for E2E tests",
            category: "salon",
            address: "123 Test St",
            phone: "1234567890",
            workingHours: { open: "09:00", close: "17:00" }
        }, { headers });
        businessId = businessRes.data.data.id;
        console.log(`✔ Business created with ID: ${businessId}`);
    } catch (err) {
        console.error("❌ Business creation failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    }

    let serviceId = "";
    try {
        console.log("\n4️⃣ Creating a service...");
        const serviceRes = await axios.post(`${API_URL}/services`, {
            serviceName: "Test Service",
            businessId: businessId,
            description: "A test service for E2E",
            estimatedDuration: 15,
            price: 100
        }, { headers });
        serviceId = serviceRes.data.data.id;
        console.log(`✔ Service created with ID: ${serviceId}`);
    } catch (err) {
        console.error("❌ Service creation failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    }

    try {
        console.log("\n5️⃣ Generating a token...");
        const tokenRes = await axios.post(`${API_URL}/queue/token`, {
            businessId,
            serviceId
        }, { headers });
        console.log(`✔ Token generated: ${tokenRes.data.data.tokenNumber}`);
    } catch (err) {
        console.error("❌ Token generation failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    }

    console.log("\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY! 🎉");
    process.exit(0);
}

runE2E();
