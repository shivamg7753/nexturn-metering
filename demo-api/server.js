const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4000;
const METERING_API = 'http://localhost:3000/api/events';

// Middleware to parse JSON and raw body
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// --- 1. Metering Middleware (First to capture everything, including 401s) ---
async function meterRequest(req, res, next) {
  const startTime = Date.now();
  let responseSize = 0;

  // Capture request size (approximate: content-length + url length)
  const requestSize = (req.headers['content-length'] ? parseInt(req.headers['content-length']) : 0) + req.url.length;

  // --- DEMO: Show Raw Data ---
  console.log('\n--- 📨 Incoming "Envelope" (Raw Data) ---');
  console.log('METHOD:', req.method);
  console.log('URL:', req.url);
  console.log('HEADERS:', JSON.stringify(req.headers, null, 2));
  console.log('-----------------------------------------\n');

  // Hook into response to capture size
  const originalWrite = res.write;
  const originalEnd = res.end;

  // Override write to count bytes
  res.write = function (chunk, ...args) {
    if (chunk) {
      responseSize += Buffer.byteLength(chunk);
    }
    return originalWrite.apply(res, [chunk, ...args]);
  };

  // Override end to count bytes and send event
  res.end = function (chunk, ...args) {
    if (chunk) {
      responseSize += Buffer.byteLength(chunk);
    }

    const duration = Date.now() - startTime;
    const customerId = req.headers['x-customer-id'] || 'demo_customer';
    const region = req.headers['x-region'] || 'us-east-1'; // Simulate region

    // Send metering event (fire and forget)
    axios.post(METERING_API, {
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: 'api_usage', // Unified event code for this demo
      customerId: customerId,
      timestamp: new Date().toISOString(),
      properties: {
        endpoint: req.path,
        method: req.method,
        status: res.statusCode,
        duration_ms: duration,
        request_size_bytes: requestSize,
        response_size_bytes: responseSize,
        bandwidth_bytes: requestSize + responseSize,
        region: region,
        api_key_used: req.headers['x-api-key'] || 'none',
        error_code: res.statusCode >= 400 ? res.statusCode : null,
        user_agent: req.headers['user-agent'] || 'unknown'
      }
    }).catch(err => {
      // Silent fail or minimal log to avoid cluttering demo output
      // console.error('Metering failed (is server running?):', err.message);
    });

    originalEnd.apply(res, [chunk, ...args]);
  };

  next();
}

app.use(meterRequest);

// --- 2. API Key Middleware ---
const VALID_API_KEYS = ['secret', 'demo-key-123', 'prod-key-456'];

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
}

app.use(validateApiKey);

// --- 3. Demo Endpoints ---

// CRUD: Get Users
app.get('/api/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  });
});

// CRUD: Create User
app.post('/api/users', (req, res) => {
  res.status(201).json({
    id: 3,
    name: req.body.name || 'Anonymous',
    created_at: new Date()
  });
});

// Upload: Simulate file upload
app.post('/api/upload', (req, res) => {
  // In a real app, you'd process the file. Here we just acknowledge the size.
  const size = req.headers['content-length'] || 0;
  res.json({
    message: 'Upload successful',
    received_bytes: parseInt(size)
  });
});

// Download: Simulate file download
app.get('/api/download/:id', (req, res) => {
  const sizeKB = 5;
  const dummyData = 'x'.repeat(1024 * sizeKB); // 5KB dummy data
  res.setHeader('Content-Disposition', `attachment; filename="file_${req.params.id}.txt"`);
  res.send(dummyData);
});

// Stream: Simulate streaming response
app.get('/api/stream/:id', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  for (let i = 1; i <= 5; i++) {
    res.write(`Chunk ${i} of data...\n`);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  res.end('Stream complete.');
});

// Delete: Simulate resource deletion
app.delete('/api/files/:id', (req, res) => {
  res.json({ message: `File ${req.params.id} deleted successfully` });
});

// Slow Endpoint: Simulate latency
app.get('/api/slow', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  res.json({ message: 'This request took 1.5 seconds' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Demo API running on http://localhost:${PORT}`);
  console.log(`🔑 Valid API Keys: ${VALID_API_KEYS.join(', ')}`);
  console.log(`📊 Metering events will be sent to ${METERING_API}`);
});
