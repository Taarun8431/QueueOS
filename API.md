# 📡 API Documentation

This document outlines the core REST API endpoints available in the QueueWISE backend (`queueOS-backend`). All endpoints are prefixed with `/api`.

---

## 🔒 Authentication

QueueWISE uses a dual-token authentication mechanism:
1. **Access Token**: A short-lived JWT passed in the `Authorization` header.
2. **Refresh Token**: A long-lived, rotating token passed securely via an `httpOnly` cookie.

### Standard Headers
For protected routes, include the Access Token:
```http
Authorization: Bearer <your_access_token>
```

### Standard Response Format
All API responses follow a uniform JSON structure:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... } // Optional payload
}
```

---

## 🧑‍🤝‍🧑 Auth Endpoints (`/api/auth`)

### 1. Register User
`POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "phone": "1234567890",
    "role": "customer" // Enum: customer, owner, staff
  }
  ```
- **Success Response (201)**: Returns user data.

### 2. Login User
`POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response (200)**: Returns `accessToken` and user data. Sets `refreshToken` cookie.

### 3. Refresh Token
`POST /api/auth/refresh`
- **Headers**: Must include valid `refreshToken` cookie.
- **Success Response (200)**: Returns new `accessToken` and rotates the refresh cookie.

---

## 🏢 Business Endpoints (`/api/business`)
*(Requires Authentication)*

### 1. Create Business
`POST /api/business`
- **Access**: `owner` only.
- **Body**:
  ```json
  {
    "businessName": "Main St Clinic",
    "businessEmail": "clinic@example.com",
    "category": "hospital",
    "address": "123 Main St",
    "phone": "9876543210",
    "workingHours": { "open": "09:00", "close": "17:00" }
  }
  ```

---

## 🎟️ Queue & Token Endpoints (`/api/queue`)
*(Requires Authentication)*

### 1. Generate Token (Join Queue)
`POST /api/queue/token`
- **Body**:
  ```json
  {
    "businessId": "<uuid>",
    "serviceId": "<uuid>",
    "preferredStaffId": "<uuid>" // Optional
  }
  ```
- **Success Response (201)**: Returns token details (e.g., `T-42`) and triggers real-time socket events.

### 2. Call Next Token
`PUT /api/queue/call-next`
- **Access**: `staff` or `owner`.
- **Body**:
  ```json
  {
    "businessId": "<uuid>",
    "serviceId": "<uuid>"
  }
  ```
- **Behavior**: Marks the next `waiting` token as `called` and triggers background notifications via BullMQ.

### 3. Mark Token Served
`PUT /api/queue/:tokenId/serve`
- **Access**: `staff` or `owner`.
- **Behavior**: Completes the token lifecycle, recording actual service duration.

---

## 🤖 Machine Learning Integration (`/api/queue/predict-wait-time`)
*(Internal routing to ML Service)*

`POST /api/queue/predict-wait-time`
- **Body**:
  ```json
  {
    "businessId": "<uuid>",
    "serviceId": "<uuid>"
  }
  ```
- **Behavior**: The Node.js backend gathers current queue length and active staff, proxies a formatted request to the Python FastAPI service, and returns the estimated wait time in minutes.
