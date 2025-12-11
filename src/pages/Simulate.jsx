import React, { useState, useEffect } from 'react';
import { useApp } from '../context/store';
import { api } from '../api/client';
import { Play, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Simulate = () => {
  const { state } = useApp();
  const [step, setStep] = useState(1);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [accountSelection, setAccountSelection] = useState('all');
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedEventSchemaId, setSelectedEventSchemaId] = useState('');
  const [eventCount, setEventCount] = useState(1);
  const [eventProperties, setEventProperties] = useState({});

  // Data state
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [eventSchemas, setEventSchemas] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Quota state
  const [quotaStatus, setQuotaStatus] = useState(null);
  const [checkingQuota, setCheckingQuota] = useState(false);

  // Load accounts when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = state.customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        const childAccounts = state.customers.filter(c => c.metadata?.parentCustomerId === selectedCustomerId);
        setAccounts([customer, ...childAccounts]);
      }
    } else {
      setAccounts([]);
    }
  }, [selectedCustomerId, state.customers]);

  // Load products when account(s) are selected
  useEffect(() => {
    const loadProducts = async () => {
      if ((accountSelection === 'all' && accounts.length > 0) || (accountSelection === 'specific' && selectedAccountIds.length > 0)) {
        try {
          setLoading(true);

          console.log('=== LOADING PRODUCTS DEBUG ===');

          // Get target account IDs
          const targetAccountIds = accountSelection === 'all' ? accounts.map(a => a.id) : selectedAccountIds;
          console.log('Target Account IDs:', targetAccountIds);

          // Get all subscriptions for these accounts
          const allSubscriptions = await api.getSubscriptions();
          console.log('All Subscriptions:', allSubscriptions.length);

          const accountSubscriptions = allSubscriptions.filter(sub =>
            targetAccountIds.includes(sub.customerId) && sub.status === 'active'
          );
          console.log('Account Subscriptions (active):', accountSubscriptions);
          console.log('Number of active subscriptions:', accountSubscriptions.length);

          // Get unique plan IDs from subscriptions
          const planIds = [...new Set(accountSubscriptions.map(sub => sub.planId))];
          console.log('Plan IDs from subscriptions:', planIds);

          // Get plans
          const allPlans = state.plans.length > 0 ? state.plans : await api.getPlans();
          console.log('All Plans:', allPlans.length);

          const accountPlans = allPlans.filter(plan => planIds.includes(plan.id));
          console.log('Account Plans:', accountPlans);
          console.log('Account Plans with productId:', accountPlans.filter(p => p.productId));

          // Get unique product IDs from plans
          const productIds = [...new Set(accountPlans.map(plan => plan.productId).filter(Boolean))];
          console.log('Product IDs from plans:', productIds);

          // Get products
          const allProducts = state.products.length > 0 ? state.products : await api.getProducts();
          console.log('All Products:', allProducts.length);
          console.log('All Product IDs:', allProducts.map(p => p.id));

          const accountProducts = allProducts.filter(product => productIds.includes(product.id));
          console.log('Filtered Account Products:', accountProducts);

          setProducts(accountProducts);
          console.log('=== END LOADING PRODUCTS DEBUG ===');
        } catch (err) {
          console.error('Failed to load products:', err);
          toast.error('Failed to load products: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setProducts([]);
      }
    };

    loadProducts();
  }, [accountSelection, selectedAccountIds, accounts, state.plans, state.products]);

  // Load event schemas when product is selected
  useEffect(() => {
    const loadEventSchemas = async () => {
      if (selectedProductId) {
        try {
          setLoading(true);

          const product = products.find(p => p.id === selectedProductId);
          setSelectedProduct(product);

          // Get plans for this product
          const allPlans = (state.plans && state.plans.length > 0) ? state.plans : await api.getPlans();
          const productPlans = allPlans.filter(plan => plan.productId === selectedProductId);

          // Get meters from plan charges
          const allMeters = (state.meters && state.meters.length > 0) ? state.meters : await api.getMeters();
          const meterIds = new Set();

          productPlans.forEach(plan => {
            const charges = typeof plan.charges === 'string' ? JSON.parse(plan.charges) : plan.charges;
            if (Array.isArray(charges)) {
              charges.forEach(charge => {
                if (charge.billableMetricId) {
                  meterIds.add(charge.billableMetricId);
                }
              });
            }
          });

          const productMeters = allMeters.filter(meter => meterIds.has(meter.id));

          // Get event schemas from meters
          const allSchemas = (state.eventSchemas && state.eventSchemas.length > 0) ? state.eventSchemas : await api.getSchemas();
          const schemaIds = [...new Set(productMeters.map(meter => meter.eventSchemaId).filter(Boolean))];
          const productSchemas = allSchemas.filter(schema => schemaIds.includes(schema.id) && schema.status === 'active');

          setEventSchemas(productSchemas);

          // Auto-select if only one schema
          if (productSchemas.length === 1) {
            setSelectedEventSchemaId(productSchemas[0].id);
          }
        } catch (err) {
          console.error('Failed to load event schemas:', err);
          toast.error('Failed to load event schemas: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setEventSchemas([]);
        setSelectedProduct(null);
      }
    };

    loadEventSchemas();
  }, [selectedProductId, products, state.plans, state.meters, state.eventSchemas]);

  // Load schema details when selected
  useEffect(() => {
    if (selectedEventSchemaId) {
      const schema = eventSchemas.find(s => s.id === selectedEventSchemaId);
      if (schema) {
        setSelectedSchema(schema);
        // Initialize event properties based on schema dimensions
        try {
          let dimensionsData = schema.dimensions;
          if (typeof dimensionsData === 'string') {
            dimensionsData = JSON.parse(dimensionsData);
          }

          const initialProps = {};

          // Handle both old format (array) and new format (object with attributes/dimensions)
          if (Array.isArray(dimensionsData)) {
            // Old format: dimensions is an array
            dimensionsData.forEach(dim => {
              initialProps[dim.name] = dim.type === 'number' ? 0 : '';
            });
          } else if (dimensionsData && typeof dimensionsData === 'object') {
            // New format: dimensions is an object with attributes and dimensions arrays
            const allFields = [
              ...(dimensionsData.attributes || []),
              ...(dimensionsData.dimensions || [])
            ];
            allFields.forEach(field => {
              initialProps[field.name] = field.type === 'number' ? 0 : '';
            });
          }

          setEventProperties(initialProps);
        } catch (err) {
          console.error('Error parsing schema dimensions', err);
          setEventProperties({});
        }
      }
    }
  }, [selectedEventSchemaId, eventSchemas]);

  // Check quotas whenever event configuration changes
  useEffect(() => {
    const checkQuotas = async () => {
      console.log('=== QUOTA CHECK TRIGGERED ===');
      console.log('selectedCustomerId:', selectedCustomerId);
      console.log('selectedEventSchemaId:', selectedEventSchemaId);
      console.log('eventCount:', eventCount);
      console.log('accountSelection:', accountSelection);
      console.log('selectedAccountIds:', selectedAccountIds);
      console.log('accounts:', accounts);

      if (selectedEventSchemaId && eventCount > 0 && (accountSelection === 'all' || selectedAccountIds.length > 0)) {
        try {
          setCheckingQuota(true);

          const targetAccountIds = accountSelection === 'all' ? accounts.map(a => a.id) : selectedAccountIds;

          console.log('targetAccountIds:', targetAccountIds);

          const params = new URLSearchParams({
            customerId: selectedCustomerId,
            accountIds: JSON.stringify(targetAccountIds),
            eventSchemaId: selectedEventSchemaId,
            eventCount: eventCount.toString(),
            properties: JSON.stringify(eventProperties)
          });

          console.log('Calling quota-check API with params:', params.toString());

          const response = await fetch(`http://localhost:3000/api/simulate/quota-check?${params}`);
          console.log('Quota check response status:', response.status);

          const data = await response.json();
          console.log('Quota check data received:', data);

          setQuotaStatus(data);
        } catch (err) {
          console.error('Error checking quotas:', err);
          setQuotaStatus(null);
        } finally {
          setCheckingQuota(false);
        }
      } else {
        console.log('Quota check skipped - conditions not met');
        setQuotaStatus(null);
      }
    };

    // Debounce quota check
    const timer = setTimeout(checkQuotas, 500);
    return () => clearTimeout(timer);
  }, [selectedEventSchemaId, eventCount, eventProperties, accountSelection, selectedAccountIds, accounts, selectedCustomerId]);

  const handlePropertyChange = (key, value) => {
    setEventProperties(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSimulate = async () => {
    if (!selectedCustomerId || !selectedEventSchemaId) {
      toast.error('Please complete all steps');
      return;
    }

    if (accountSelection === 'specific' && selectedAccountIds.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    setSimulating(true);

    try {
      const targetAccountIds = accountSelection === 'all'
        ? accounts.map(a => a.id)
        : selectedAccountIds;

      const response = await fetch('http://localhost:3000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          accountSelection: accountSelection,
          accountIds: targetAccountIds,
          eventSchemaId: selectedEventSchemaId,
          eventConfig: {
            count: eventCount,
            properties: eventProperties
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to simulate events');
      }

      const result = await response.json();

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Successfully created {result.eventsCreated} event{result.eventsCreated !== 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Events are now visible in the Event Stream
                </p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });

      // Reset form
      setStep(1);
      setSelectedCustomerId('');
      setAccountSelection('all');
      setSelectedAccountIds([]);
      setSelectedProductId('');
      setSelectedEventSchemaId('');
      setEventCount(1);
      setEventProperties({});
    } catch (error) {
      console.error('Error simulating events:', error);
      toast.error(error.message || 'Failed to simulate events');
    } finally {
      setSimulating(false);
    }
  };

  const canProceedToStep2 = selectedCustomerId !== '';
  const canProceedToStep3 = accountSelection === 'all' || selectedAccountIds.length > 0;
  const canProceedToStep4 = selectedProductId !== '';
  const canProceedToStep5 = selectedEventSchemaId !== '';
  const canSimulate = canProceedToStep2 && canProceedToStep3 && canProceedToStep4 && canProceedToStep5 && (quotaStatus === null || quotaStatus.allowed);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Simulate Events</h1>
        <p className="text-gray-500 mt-1">Generate test usage events based on customer configuration</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {s}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                  {s === 1 && 'Customer'}
                  {s === 2 && 'Account'}
                  {s === 3 && 'Product'}
                  {s === 4 && 'Event Schema'}
                  {s === 5 && 'Configure'}
                </span>
              </div>
              {idx < 4 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Customer</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a customer...</option>
                {state.customers
                  .filter(c => !c.metadata?.parentCustomerId)
                  .map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Account Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Account(s)</h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={accountSelection === 'all'}
                  onChange={(e) => {
                    setAccountSelection(e.target.value);
                    setSelectedAccountIds([]);
                  }}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  All accounts for this customer ({accounts.length} account{accounts.length !== 1 ? 's' : ''})
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={accountSelection === 'specific'}
                  onChange={(e) => setAccountSelection(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Specific account
                </span>
              </label>

              {accountSelection === 'specific' && (
                <div className="ml-6 space-y-2">
                  {accounts.map(account => (
                    <label key={account.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAccountIds.includes(account.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccountIds([...selectedAccountIds, account.id]);
                          } else {
                            setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id));
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {account.accountName || account.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Product Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Product</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product (from account subscriptions)
              </label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No products found for the selected account(s). Make sure the account has active subscriptions.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedProduct && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedProduct.description || 'No description available'}
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!canProceedToStep4}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Event Schema Selection */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Event Schema</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Schema (from product usage meters)
              </label>
              {loading ? (
                <div className="text-sm text-gray-500">Loading event schemas...</div>
              ) : eventSchemas.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No event schemas found for this product. The product's plans may not have usage-based charges.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedEventSchemaId}
                  onChange={(e) => setSelectedEventSchemaId(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an event schema...</option>
                  {eventSchemas.map(schema => (
                    <option key={schema.id} value={schema.id}>
                      {schema.name}
                    </option>
                  ))}
                </select>
              )}
              {selectedSchema && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedSchema.description || 'No description available'}
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!canProceedToStep5 || eventSchemas.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Configure Event */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configure Event Simulation</h3>

            {/* Event Count Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Events to Generate
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={eventCount}
                onChange={(e) => setEventCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Each event will be created with the schema properties configured below
              </p>
            </div>

            {/* Quota Status Section */}
            {checkingQuota && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">Checking quotas...</p>
              </div>
            )}

            {quotaStatus && quotaStatus.quotas && quotaStatus.quotas.length > 0 && (
              <div className={`rounded-lg p-4 border ${!quotaStatus.allowed
                ? 'bg-red-50 border-red-200'
                : quotaStatus.quotas.some(q => q.remaining / q.quota < 0.2)
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
                }`}>
                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${!quotaStatus.allowed
                  ? 'text-red-900'
                  : quotaStatus.quotas.some(q => q.remaining / q.quota < 0.2)
                    ? 'text-yellow-900'
                    : 'text-green-900'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${!quotaStatus.allowed
                    ? 'bg-red-600'
                    : quotaStatus.quotas.some(q => q.remaining / q.quota < 0.2)
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                    }`}></span>
                  Quota Status
                </h4>
                <div className="space-y-3">
                  {quotaStatus.quotas.map((quota, idx) => (
                    <div key={idx} className="bg-white rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{quota.meterName}</span>
                        {quota.wouldExceed && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Quota Exceeded</span>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Usage:</span>
                          <span className="font-mono">{quota.currentUsage.toLocaleString()} / {quota.quota.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Simulated Usage:</span>
                          <span className="font-mono text-indigo-600">+{quota.simulatedUsage.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-600">Total After Simulation:</span>
                          <span className={`font-mono ${quota.wouldExceed ? 'text-red-600' : 'text-green-600'}`}>
                            {quota.totalAfterSimulation.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-mono">{quota.remaining.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${quota.wouldExceed ? 'bg-red-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${Math.min((quota.totalAfterSimulation / quota.quota) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {!quotaStatus.allowed && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ {quotaStatus.message}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Reduce the number of events or adjust event properties to stay within quota limits.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Schema Dimensions Section */}
            {selectedSchema && (
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  Event Schema Dimensions for {selectedSchema.name}
                </h4>

                {(() => {
                  // Parse dimensions if it's a JSON string
                  let dimensionsData = selectedSchema.dimensions;
                  if (typeof dimensionsData === 'string') {
                    try {
                      dimensionsData = JSON.parse(dimensionsData);
                    } catch (e) {
                      console.error('Error parsing dimensions:', e);
                      dimensionsData = null;
                    }
                  }

                  // Combine attributes and dimensions arrays
                  let allFields = [];
                  if (dimensionsData) {
                    if (Array.isArray(dimensionsData)) {
                      // Old format: dimensions is an array
                      allFields = dimensionsData;
                    } else if (typeof dimensionsData === 'object') {
                      // New format: dimensions has attributes and dimensions properties
                      allFields = [
                        ...(dimensionsData.attributes || []),
                        ...(dimensionsData.dimensions || [])
                      ];
                    }
                  }

                  if (allFields.length === 0) {
                    return (
                      <div className="bg-white rounded-lg p-4 border border-indigo-100">
                        <p className="text-sm text-gray-600">
                          This event schema has no custom fields defined.
                          Events will be created with only timestamp and customer information.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {allFields.map((field, idx) => {
                        // Determine if this is an attribute (from attributes array) vs dimension
                        const isAttribute = dimensionsData?.attributes?.some(attr => attr.name === field.name);
                        const fieldLabel = isAttribute ? `Count of ${field.name}` : field.name;

                        return (
                          <div key={field.name || idx} className="bg-white rounded-lg p-3 border border-indigo-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {fieldLabel}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                              {field.type && (
                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                  ({field.type})
                                </span>
                              )}
                              {field.unit && (
                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                  Unit: {field.unit}
                                </span>
                              )}
                            </label>
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={eventProperties[field.name] || ''}
                              onChange={(e) => handlePropertyChange(field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`Enter ${fieldLabel.toLowerCase()}${field.type === 'number' ? ' (number)' : ''}${field.unit ? ' in ' + field.unit : ''}`}
                            />
                            {field.description && (
                              <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSimulate}
                disabled={!canSimulate || simulating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {simulating ? 'Simulating...' : `Simulate ${eventCount} Event${eventCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">About Event Simulation</p>
          <p>Simulated events will be created with the current timestamp and will immediately appear in the Event Stream. This allows you to test metering behavior without real usage data.</p>
        </div>
      </div>
    </div>
  );
};
