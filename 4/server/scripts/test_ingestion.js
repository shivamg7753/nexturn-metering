import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testIngestion() {
    console.log('🚀 Starting Ingestion Test...');

    const eventData = {
        eventName: 'api_requests',
        customerId: 'cust_test_999',
        payload: {
            api_requests: {
                value: 42,
                unit: 'request'
            }
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ingestion successful:', result);
        } else {
            const error = await response.json();
            console.error('❌ Ingestion failed:', error);
        }

        const summaryRes = await fetch(`${BASE_URL}/ingest/summary?eventName=api_requests`);
        const summary = await summaryRes.json();
        console.log('📊 Summary data:', summary);

    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

testIngestion();
