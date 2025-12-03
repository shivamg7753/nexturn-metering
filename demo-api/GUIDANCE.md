# Demo Server & Metering Guidance

This document explains the design and usage of the Demo Product Server, including how to authenticate and why specific attributes are metered.

## 1. Getting Started

The demo server runs on **port 4000** and simulates a real-world file management and user API.

### Prerequisites
- Ensure the **Metering Engine** is running on port 3000.
- Start the Demo Server:
  ```bash
  cd demo-api
  npm start
  ```

### Authentication
All endpoints require an API Key passed in the header `x-api-key`.
**Valid Keys:** `secret`, `demo-key-123`, `prod-key-456`

Example:
```bash
curl http://localhost:4000/api/users -H "x-api-key: secret"
```

## 2. Available Endpoints

| Method | Endpoint | Description | Metering Focus |
|--------|----------|-------------|----------------|
| `GET` | `/api/users` | List users | Request Count |
| `POST` | `/api/upload` | Upload file | **Request Size** (Bandwidth In) |
| `GET` | `/api/download/:id` | Download file | **Response Size** (Bandwidth Out) |
| `GET` | `/api/stream/:id` | Stream data | **Duration** & Bandwidth |
| `DELETE` | `/api/files/:id` | Delete file | Request Count |
| `GET` | `/api/slow` | Slow request | **Latency** (Duration) |

## 3. Metered Attributes & Rationale

We capture a comprehensive set of attributes for every request to enable flexible billing models.

### A. `bandwidth_bytes` (Total Data Transfer)
- **What it is**: Sum of `request_size_bytes` and `response_size_bytes`.
- **Why select it**: Essential for infrastructure cost recovery. Cloud providers charge for data egress. You can bill customers per GB of data transferred.
- **Use Case**: "High Bandwidth Plan" charges $0.10/GB.

### B. `duration_ms` (Latency)
- **What it is**: Time taken to process the request (in milliseconds).
- **Why select it**: Critical for SLA (Service Level Agreement) monitoring.
- **Use Case**: Refund customers if 99% of requests take > 500ms. Or charge premium for "High Performance" endpoints.

### C. `status` & `error_code`
- **What it is**: HTTP status code (200, 401, 500, etc.).
- **Why select it**: To distinguish between successful usage and errors.
- **Use Case**: Don't bill for 5xx server errors. Track 4xx errors to detect abuse or misconfiguration.

### D. `endpoint` & `method`
- **What it is**: The specific API resource accessed (e.g., `/api/upload`).
- **Why select it**: Different features have different value.
- **Use Case**: Charge more for "Premium" endpoints like Video Transcoding (simulated via upload) vs simple User Fetching.

### E. `region`
- **What it is**: Simulated geographical region (e.g., `us-east-1`).
- **Why select it**: Costs vary by region.
- **Use Case**: Charge higher rates for traffic in expensive regions like `sa-east-1`.

### F. `api_key_used`
- **What it is**: The specific key used for the request.
- **Why select it**: To track usage per specific access credential (useful if a customer has multiple keys for different teams).

## 4. Example Metering Event

Every request sends a JSON payload to the metering engine:

```json
{
  "transactionId": "tx_1732876...",
  "code": "api_usage",
  "customerId": "demo_customer",
  "timestamp": "2025-11-29T12:00:00Z",
  "properties": {
    "endpoint": "/api/upload",
    "method": "POST",
    "status": 200,
    "duration_ms": 45,
    "request_size_bytes": 10240,
    "response_size_bytes": 150,
    "bandwidth_bytes": 10390,
    "region": "us-east-1",
    "api_key_used": "secret"
  }
}
```

This data allows you to build complex billing logic in the Metering Engine, such as:
- "First 1GB free, then $0.05/MB"
- "$10/month base + $0.001 per request"
- "Premium SLA: 50% discount if latency > 1s"
