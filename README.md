# QueueWISE (QueueOS)
**Enterprise-Grade Queue Management and Analytics Platform**

QueueWISE is a highly scalable, real-time queue management distributed system architected for massive concurrency. It provides businesses with a resilient infrastructure to manage high-volume customer queues while integrating machine-learning algorithms for predictive wait-time analytics.

The system is designed to withstand extreme load spikes ("Thundering Herd" scenarios) by leveraging in-memory caching, distributed locking mechanisms, and graceful fault-tolerance protocols.

---

## Architecture Overview
The system relies on a microservices-based architecture orchestrated via Docker. 
* **Primary API Node:** Manages business logic, authentication, and HTTP transaction routing.
* **Predictive ML Node:** Dedicated service for mathematical regressions and predictive analytics.
* **Persistent Data Layer:** Handles long-term storage, indexing, and historical analytics.
* **In-Memory Cache & Message Broker:** Handles session states, rate-limiting, distributed locks, and WebSocket event distribution.

## Technology Stack
* **Runtime Environments:** Node.js (Express), Python (FastAPI)
* **Data Persistence:** MongoDB (Compound Indexed)
* **Caching & IPC:** Redis
* **Real-Time Communication:** Socket.io (Redis Pub/Sub Adapter)
* **Containerization & Orchestration:** Docker, Docker Compose
* **Benchmarking:** Artillery, Autocannon

---

## Core System Capabilities

### 1. High-Concurrency Transaction Integrity
To handle simultaneous inbound traffic during peak operational hours, the system utilizes Redis `SETNX` distributed locks paired with atomic `INCR` operations. This ensures that concurrent token generation requests are serialized efficiently, preventing race conditions and ensuring database integrity at scale.

### 2. High-Performance Caching Layer
Read-heavy endpoints, such as real-time queue state retrieval, bypass the primary database. By implementing a Redis caching layer with a strict TTL (Time-To-Live) eviction policy, the system drastically reduces disk I/O, maintaining sub-200ms latencies even under severe load.

### 3. Fault-Tolerant Machine Learning Integration
The Wait Time Prediction service is decentralized into a separate Python/FastAPI microservice. To prevent single points of failure, the primary Node.js API implements interceptor logic; should the ML service experience an outage, the Node.js API seamlessly falls back to local mathematical averages, ensuring 100% uptime for the end user.

### 4. Infrastructure Resiliency (Graceful Shutdowns)
QueueWISE is engineered for dynamic cloud environments where horizontal scaling actions frequently terminate instances. The application intercepts OS-level signals (`SIGTERM` / `SIGINT`) to halt incoming traffic, finalize active network requests, and cleanly sever database connections, thereby preventing orphaned locks or corrupted transactions.

### 5. Access Control and Rate Limiting
The API boundary is protected by strict rate-limiting middlewares to mitigate volumetric DDoS and Brute Force credential stuffing attacks. Internal endpoints are secured via JWT-based Role-Based Access Control (RBAC), firmly isolating business administrative rights from standard staff operational capabilities.

---

## Performance Benchmarks
Extensive stress testing was conducted to identify the theoretical limits of the single-threaded Node.js event loop:
* **Throughput Testing:** Achieved >2,700 Requests Per Second (RPS) on cached read endpoints with 0% error rate.
* **Saturation Testing:** Subjected the system to a sustained 1,000 concurrent RPS against computationally expensive endpoints to determine CPU saturation thresholds and establish horizontal scaling baselines.

---

## Local Deployment

The application is containerized for guaranteed environmental consistency.

### Prerequisites
* Docker Engine
* Docker Compose

### Initialization
Execute the following command from the project root to provision and link all microservices:
```bash
docker-compose up --build -d
```

**Provisioned Services:**
1. `queueos_mongo` - Target Port: 27017
2. `queueos_redis` - Target Port: 6379
3. `queueos_ml` - Target Port: 8000
4. `queueos_backend` - Target Port: 5000