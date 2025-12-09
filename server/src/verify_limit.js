
// using global fetch 

const BASE_URL = 'http://localhost:3000/api';

async function run() {
  try {
    console.log('--- Starting Verification ---');

    // 1. Create Product
    console.log('1. Creating Product...');
    const productRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Storage Service ' + Date.now(),
        description: 'Test Product'
      })
    });
    const product = await productRes.json();
    if (!product.id) throw new Error('Failed to create product: ' + JSON.stringify(product));
    console.log('Product Created:', product.id);

    // 2. Create Plans
    console.log('2. Creating Plans...');
    // Plan A
    const planARes = await fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Basic Storage',
        productId: product.id,
        type: 'recurring',
        interval: 'month',
        intervalCount: 1,
        amountCents: 1000,
        currency: 'USD',
        payInAdvance: true,
        trialPeriod: 0,
        charges: [],
        status: 'active'
      })
    });
    const planA = await planARes.json();
    console.log('Plan A Created:', planA.id);

    // Plan B
    const planBRes = await fetch(`${BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pro Storage',
        productId: product.id,
        type: 'recurring',
        interval: 'month',
        intervalCount: 1,
        amountCents: 2000,
        currency: 'USD',
        payInAdvance: true,
        trialPeriod: 0,
        charges: [],
        status: 'active'
      })
    });
    const planB = await planBRes.json();
    console.log('Plan B Created:', planB.id);

    // 3. Create Customer
    console.log('3. Creating Customer...');
    const customerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Limit User ' + Date.now(),
        email: `testlimit${Date.now()}@example.com`,
        externalId: `cust_${Date.now()}`,
        currency: 'USD',
        customerType: 'individual'
      })
    });
    const customer = await customerRes.json();
    console.log('Customer Created:', customer.id);

    // 4. Subscribe to Plan A
    console.log('4. Subscribing to Plan A (Should Succeed)...');
    const sub1Res = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        planId: planA.id,
        status: 'active'
      })
    });
    if (sub1Res.status !== 200) {
      const body = await sub1Res.json();
      console.log('FAIL: First Sub Status ' + sub1Res.status + ' Body: ' + JSON.stringify(body));
      process.exit(1);
    }
    console.log('PASS: First Sub');

    // 5. Subscribe to Plan B (Should Fail)
    console.log('5. Subscribing to Plan B (Should Fail)...');
    const sub2Res = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        planId: planB.id,
        status: 'active'
      })
    });

    if (sub2Res.status === 400) {
      console.log('PASS: Second Sub Blocked (400)');
    } else {
      console.log('FAIL: Second Sub Status ' + sub2Res.status);
      const body = await sub2Res.json();
      console.log('Response: ' + JSON.stringify(body));
      process.exit(1);
    }

  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
}

run();
