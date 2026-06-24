const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

const logInfo = (msg) => console.log(`\x1b[36mℹ ${msg}\x1b[0m`);
const logSuccess = (msg) => console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
const logError = (msg) => console.log(`\x1b[31m✖ ${msg}\x1b[0m`);

let ownerToken, ownerId;
let staffToken, staffId, staffCreds;
let customerToken, customerId;
let businessId, serviceId;
let tokenId;

const api = axios.create({ baseURL: API_URL });

const runTests = async () => {
    try {
        logInfo("Starting E2E Tests...");
        
        // --- PHASE 1: OWNER AUTH ---
        logInfo("--- Phase 1: Authentication ---");
        const r1 = await api.post('/auth/register', { name: "Test Owner", email: `owner_${Date.now()}@test.com`, password: "password123", role: "owner", phone: "1234567890" });
        logSuccess("Owner registered");
        const l1 = await api.post('/auth/login', { email: r1.data.data.email, password: "password123" });
        ownerToken = l1.data.accessToken;

        const r2 = await api.get('/auth/me', { headers: { Authorization: `Bearer ${ownerToken}` } });
        ownerId = r2.data.data.userId;
        logSuccess("Owner profile fetched");

        // --- PHASE 2: BUSINESS & SERVICE ---
        logInfo("--- Phase 2: Business & Service ---");
        const b1 = await api.post('/business', { businessName: "Test Clinic", businessEmail: `test_${Date.now()}@clinic.com`, description: "A great clinic", category: "hospital", address: "123 Main St", phone: "1234567890", workingHours: { open: "09:00", close: "18:00" } }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        businessId = b1.data.data._id;
        logSuccess("Business created: " + businessId);

        const s1 = await api.post('/services', { businessId, serviceName: "Consultation", estimatedDuration: 15, price: 50 }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        serviceId = s1.data.data._id;
        logSuccess("Service created: " + serviceId);

        // --- PHASE 3: STAFF MANAGEMENT ---
        logInfo("--- Phase 3: Staff Management ---");
        const st1 = await api.post('/staff/create-assignment', { name: "Test Staff", phone: "0987654321", businessId }, { headers: { Authorization: `Bearer ${ownerToken}` } });
        staffCreds = st1.data.data.credentials;
        logSuccess("Staff created and assigned: " + staffCreds.email);

        const st2 = await api.post('/auth/login', { email: staffCreds.email, password: staffCreds.password });
        staffToken = st2.data.accessToken;
        logSuccess("Staff logged in");

        // --- PHASE 4: CUSTOMER LIFECYCLE ---
        logInfo("--- Phase 4: Customer Lifecycle ---");
        const c1 = await api.post('/auth/register', { name: "Test Customer", email: `cust_${Date.now()}@test.com`, password: "password123", role: "customer", phone: "0987654321" });
        logSuccess("Customer registered");
        const l2 = await api.post('/auth/login', { email: c1.data.data.email, password: "password123" });
        customerToken = l2.data.accessToken;
        customerId = l2.data.data.id;
        logSuccess("Customer registered");

        const q1 = await api.post('/queue/token', { businessId, serviceId }, { headers: { Authorization: `Bearer ${customerToken}` } });
        tokenId = q1.data.data._id;
        logSuccess("Customer joined queue: Token #" + q1.data.data.tokenNumber);

        // --- PHASE 5: STAFF QUEUE OPERATIONS ---
        logInfo("--- Phase 5: Staff Queue Operations ---");
        const sq1 = await api.get(`/queue/current/${businessId}/all`, { headers: { Authorization: `Bearer ${staffToken}` } });
        logSuccess(`Staff fetched active queue. Size: ${sq1.data.data.length}`);

        const sq2 = await api.post('/queue/call-next', { businessId, serviceId: 'all' }, { headers: { Authorization: `Bearer ${staffToken}` } });
        logSuccess("Staff called next token: #" + sq2.data.data.tokenNumber);

        const sq3 = await api.put(`/queue/served/${tokenId}`, {}, { headers: { Authorization: `Bearer ${staffToken}` } });
        logSuccess("Staff marked token as served");

        // Edge Cases
        const q2 = await api.post('/queue/token', { businessId, serviceId }, { headers: { Authorization: `Bearer ${customerToken}` } });
        const token2 = q2.data.data._id;
        logSuccess("Customer joined queue again: Token #" + q2.data.data.tokenNumber);

        const cancel1 = await api.put(`/queue/cancel/${token2}`, {}, { headers: { Authorization: `Bearer ${customerToken}` } });
        logSuccess("Customer cancelled token");

        const q3 = await api.post('/queue/token', { businessId, serviceId }, { headers: { Authorization: `Bearer ${customerToken}` } });
        const token3 = q3.data.data._id;
        
        await api.post('/queue/call-next', { businessId, serviceId: 'all' }, { headers: { Authorization: `Bearer ${staffToken}` } });
        await api.put(`/queue/no-show/${token3}`, {}, { headers: { Authorization: `Bearer ${staffToken}` } });
        logSuccess("Staff marked token as no-show");

        logInfo("All tests passed successfully! 🎉");

    } catch (err) {
        logError("Test failed!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
            console.error("Endpoint:", err.config.method.toUpperCase() + " " + err.config.url);
        } else {
            console.error("Error:", err);
        }
        process.exit(1);
    }
}

runTests();
