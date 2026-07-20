
  
 🕒 QueueWISE Platform

**Intelligent Queue Management & ML-Powered Wait-Time Predictions**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Node](https://img.shields.io/badge/Node-20-green)
![Prisma](https://img.shields.io/badge/Prisma-ORM-teal)
![FastAPI](https://img.shields.io/badge/FastAPI-ML-009688)



## Overview

**QueueWISE** is a modern, full-stack queue management and appointment scheduling platform designed to streamline customer flow for various businesses (Hospitals, Salons, Government Offices, Service Centers, etc.). 

By combining real-time WebSockets, background BullMQ processing, and an intelligent **Machine Learning Service**, QueueWISE dynamically predicts queue wait times based on historical service loads and staff availability.

---

## Key Features

- **Real-Time Queue Management**: Live token status updates powered by `Socket.io` and Redis.
- **AI Wait-Time Predictions**: Python-based FastAPI Machine Learning service for dynamic wait-time estimation.
- **Role-Based Access Control (RBAC)**: Secure access tiers for `Customers`, `Staff` (e.g. Receptionists), `Owners`, and `Admins`.
- **Background Notification Workers**: Asynchronous push notifications (BullMQ + Redis) for token calls and appointments.
- **Enterprise Multi-Tenancy**: Built for scale, supporting multiple businesses, customized service types, and dynamic staff assignments.
- **Seamless Booking**: Easy appointment scheduling with calendar integrations and digital intake forms.

---

## Technology Stack

QueueWISE embraces a robust microservice-inspired architecture separated into three distinct domains:

### 1. Frontend Client (`queueOS-frontend`)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **State & Routing**: React Router DOM, Context API
- **Real-Time**: Socket.io-client

### 2. Backend Server (`queueOS-backend`)
- **Core**: Node.js + Express
- **Database**: PostgreSQL (with Prisma ORM)
- **Caching & Pub/Sub**: Redis
- **Background Jobs**: BullMQ (Notification Workers)
- **Security**: JWT Authentication, bcrypt, Helmet, rate-limiting

### 3. ML Prediction Service (`queueOS-ml`)
- **Core**: Python + FastAPI
- **Model Training**: Scikit-Learn (`wait_time_model.pkl`), Pandas
- **Server**: Uvicorn

---

## Project Structure

```text
QueueWISE/
├── queueOS-frontend/      # React SPA Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based page views
│   │   └── api/           # Axios interceptors and services
├── queueOS-backend/       # Node.js API Server
│   ├── prisma/            # PostgreSQL Schema & Migrations
│   ├── src/
│   │   ├── controllers/   # Route logic
│   │   ├── routes/        # Express routers
│   │   ├── workers/       # BullMQ Background workers
│   │   └── config/        # Environment & Redis configuration
└── queueOS-ml/            # Python ML Service
    ├── api.py             # FastAPI entrypoint
    ├── train_model.py     # Model generation script
    └── requirements.txt   # Python dependencies
```

---

## Getting Started

### Prerequisites
- Node.js (v20+)
- Python (v3.10+)
- PostgreSQL Database Server
- Redis Server (or Cloud Redis URI)

### 1. Database Setup (Backend)

Navigate to the backend directory and configure your environment:

```bash
cd queueOS-backend
cp .env.example .env
# Edit .env with your PostgreSQL and Redis credentials
```

Install dependencies and run migrations:
```bash
npm install
npx prisma generate
npx prisma db push
```

Start the backend server:
```bash
npm run dev
```

### 2. ML Service Setup (Python)

Navigate to the ML service directory and set up the Python environment:

```bash
cd queueOS-ml
python -m venv venv
source venv/bin/activate  # (On Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

Start the prediction API:
```bash
python -m uvicorn api:app --reload
```

### 3. Frontend Setup (React)

Navigate to the frontend directory:

```bash
cd queueOS-frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Documentation

For a deeper dive into the technical details of the platform, please refer to the following documentation files:

- [**ARCHITECTURE.md**](./ARCHITECTURE.md): Detailed system design, data flow, and component relationships.
- [**API.md**](./API.md): Comprehensive REST API endpoint reference and authentication guides.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.