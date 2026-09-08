# 🚀 QueueWISE API Latency Report

This report contains the real integration latency metrics for the core endpoints.

| Endpoint Name | Route | Status Code | Latency (ms) |
| --- | --- | --- | --- |
| Register Owner | `POST` `/api/auth/register` | 201 | 553.23 ms |
| Login Auth (Bad Creds) | `POST` `/api/auth/login` | 400 | 213.72 ms |
| Health Check | `GET` `/health` | 200 | 18.72 ms |
| Fetch Public Businesses | `GET` `/api/business` | 401 | 99.10 ms |
| Unauthorized Access | `GET` `/api/auth/me` | 401 | 200.22 ms |
| Create Business (Fail) | `POST` `/api/business` | 401 | 74.87 ms |
| Get Analytics (Fail) | `GET` `/api/analytics/business/business-uuid` | 401 | 94.76 ms |