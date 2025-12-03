# Demo API Data

This directory contains sample data for testing the metering engine.

## Files

### `sample-event-schemas.json`
Contains 10 different event schema definitions covering common use cases:
- **API Request** - Track API calls with endpoint, method, response time, etc.
- **Storage Usage** - Monitor storage consumption
- **Compute Usage** - Track compute/processing time
- **Active User** - Monitor unique active users
- **Data Transfer** - Track bandwidth usage
- **Database Query** - Monitor database operations
- **Email Sent** - Track email sending
- **SMS Sent** - Track SMS messaging
- **Video Processing** - Monitor video encoding/transcoding
- **AI Model Inference** - Track AI/ML predictions

### `sample-events.json`
Contains sample event data that matches the schemas above. 

**Important**: You need to replace the placeholder `eventSchemaId` values with actual IDs from your created schemas.

## Usage

### 1. Create Event Schemas

Use the UI or API to create event schemas from `sample-event-schemas.json`:

```bash
# Example: Create API Request schema
curl -X POST http://localhost:3000/api/schemas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Request",
    "description": "Track API requests made by customers",
    "dimensions": {
      "attributes": [
        { "name": "endpoint", "unit": "string" },
        { "name": "method", "unit": "string" },
        { "name": "response_time_ms", "unit": "milliseconds" }
      ],
      "dimensions": ["region", "environment"]
    }
  }'
```

### 2. Update Event Schema IDs

After creating schemas, copy their IDs and update `sample-events.json`:
- Replace `REPLACE_WITH_API_REQUEST_SCHEMA_ID` with the actual schema ID
- Replace other placeholder IDs similarly

### 3. Ingest Events

Send events to the API:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "evt_001",
    "eventSchemaId": "your-schema-id-here",
    "customerId": "cus_demo_001",
    "timestamp": "2025-12-03T10:00:00Z",
    "properties": {
      "endpoint": "/api/v1/users",
      "method": "GET",
      "response_time_ms": 45
    }
  }'
```

## Tips

- Start with 2-3 schemas for your demo
- Use realistic property values
- Ensure `customerId` matches an existing customer
- Use ISO 8601 format for timestamps
- The `transactionId` must be unique for idempotency
