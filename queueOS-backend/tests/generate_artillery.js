require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');

async function generate() {
    console.log("Connecting to DB to fetch IDs...");
    await mongoose.connect(process.env.MONGO_URL);
    const Business = require('../src/models/business.model');
    const Service = require('../src/models/services.model');
    
    const business = await Business.findOne();
    const service = await Service.findOne();

    if(!business || !service) {
        console.error("No data found in DB. Run E2E tests first.");
        process.exit(1);
    }

    const yml = `
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 5
      arrivalRate: 50
      name: "Phase 1: Warm up (50 users/sec)"
    - duration: 10
      arrivalRate: 200
      name: "Phase 2: Heavy Load (200 users/sec)"
    - duration: 10
      arrivalRate: 1000
      name: "Phase 3: Breaking Point (1,000 users/sec)"
  http:
    timeout: 5
scenarios:
  - name: "Mixed Traffic Simulation"
    flow:
      - get:
          url: "/api/queue/current/${business._id}/${service._id}"
      - post:
          url: "/api/queue/predict-wait-time"
          json:
            businessCategory: "hospital"
            serviceType: "consultation"
            queueLength: 5
            hourOfDay: 14
            dayOfWeek: 2
            avgServiceDuration: 15
            staffCount: 2
`;
    fs.writeFileSync('tests/artillery-stress.yml', yml);
    console.log("tests/artillery-stress.yml successfully generated with dynamic DB IDs!");
    process.exit(0);
}
generate();
