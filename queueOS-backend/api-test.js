require("dotenv").config();
const http = require("http");

const BASE = "http://localhost:5000";

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(payload && { "Content-Length": Buffer.byteLength(payload) }),
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function log(step, label, r) {
  const ok = r.body?.success ? "✅" : "❌";
  console.log(`\n[${step}] ${label}`);
  console.log(`    Status: ${r.status}  success: ${r.body?.success}`);
  if (r.body?.message) console.log(`    Message: ${r.body.message}`);
  if (r.body?.data) {
    const d = r.body.data;
    const info = [d._id && `id=${d._id}`, d.tokenNumber && `tokenNumber=${d.tokenNumber}`,
      d.status && `status=${d.status}`, d.position !== undefined && `position=${d.position}`]
      .filter(Boolean).join("  ");
    if (info) console.log(`    Data: ${info}`);
  }
  if (r.body?.count !== undefined) console.log(`    Count: ${r.body.count}`);
}

async function run() {
  console.log("========== QUEUEWISE API TEST ==========\n");

  // 1. Login all three users
  const [ownerLogin, customerLogin, staffLogin] = await Promise.all([
    request("POST", "/api/auth/login", { email: "testowner99@test.com", password: "Test@1234" }),
    request("POST", "/api/auth/login", { email: "testcustomer99@test.com", password: "Test@1234" }),
    request("POST", "/api/auth/login", { email: "teststaff99@test.com", password: "Test@1234" }),
  ]);
  const ownerToken    = ownerLogin.body.token;
  const customerToken = customerLogin.body.token;
  const staffToken    = staffLogin.body.token;
  console.log(`[1] LOGIN  owner=${ownerToken ? "✅" : "❌"}  customer=${customerToken ? "✅" : "❌"}  staff=${staffToken ? "✅" : "❌"}`);

  // 2. Create Business
  const bizR = await request("POST", "/api/business", {
    businessName: "QueueWise Test Clinic",
    businessEmail: `qwtestclinic${Date.now()}@test.com`,
    description: "API test clinic",
    category: "hospital",
    address: "456 API Test Ave",
    phone: "9998887777",
    workingHours: { open: "08:00", close: "20:00" },
  }, ownerToken);
  log(2, "CREATE BUSINESS", bizR);
  const bizId = bizR.body.data?._id;

  // 3. Create Service
  const svcR = await request("POST", "/api/services", {
    serviceName: "General OPD",
    businessId: bizId,
    description: "General consultation",
    estimatedDuration: 15,
    price: 100,
  }, ownerToken);
  log(3, "CREATE SERVICE", svcR);
  const svcId = svcR.body.data?._id;

  // 4. Customer generates token (joins queue)
  const tokR = await request("POST", "/api/queue/token", {
    businessId: bizId,
    serviceId: svcId,
  }, customerToken);
  log(4, "GENERATE TOKEN (customer joins queue)", tokR);
  const tokenId = tokR.body.data?._id;

  // 5. Customer checks queue position
  const posR = await request("GET", `/api/queue/position/${tokenId}`, null, customerToken);
  log(5, "GET QUEUE POSITION", posR);

  // 6. Staff views current queue
  const cqR = await request("GET", `/api/queue/current/${bizId}/${svcId}`, null, staffToken);
  log(6, "GET CURRENT QUEUE (staff view)", cqR);

  // 7. Staff calls next token — BullMQ job fires + Socket.io emits
  console.log("\n[7] CALL NEXT TOKEN → BullMQ job should fire + Socket.io emit");
  console.log("    Watch server terminal for: [Worker] Processing job...");
  const callR = await request("POST", "/api/queue/call-next", {
    businessId: bizId,
    serviceId: svcId,
  }, staffToken);
  log(7, "CALL NEXT TOKEN", callR);

  // 8. Check position again — token should now be status=called
  const pos2R = await request("GET", `/api/queue/position/${tokenId}`, null, customerToken);
  log(8, "QUEUE POSITION AFTER CALL (should be status=called)", pos2R);

  console.log("\n========== TEST COMPLETE ==========");

  // Summary
  const results = [bizR, svcR, tokR, posR, cqR, callR, pos2R];
  const passed = results.filter(r => r.body?.success).length;
  console.log(`\nResult: ${passed}/${results.length} passed`);
}

run().catch(console.error);
