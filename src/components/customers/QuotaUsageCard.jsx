import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

export const QuotaUsageCard = ({ accountId, accountName }) => {
  const [quotaData, setQuotaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotaData = async () => {
      try {
        setLoading(true);

        // Fetch subscriptions for this account
        const subscriptionsRes = await fetch(`http://localhost:3000/api/subscriptions`);
        const allSubscriptions = await subscriptionsRes.json();
        const accountSubscriptions = allSubscriptions.filter(
          s => s.customerId === accountId && s.status === 'active'
        );

        if (accountSubscriptions.length === 0) {
          setQuotaData(null);
          setLoading(false);
          return;
        }

        // Fetch plans
        const plansRes = await fetch(`http://localhost:3000/api/plans`);
        const plans = await plansRes.json();

        // Fetch meters
        const metersRes = await fetch(`http://localhost:3000/api/meters`);
        const meters = await metersRes.json();

        // Fetch events for this account
        const eventsRes = await fetch(`http://localhost:3000/api/events/${accountId}`);
        const events = await eventsRes.json();

        const quotas = [];

        for (const subscription of accountSubscriptions) {
          const plan = plans.find(p => p.id === subscription.planId);
          if (!plan) continue;

          console.log('=== QUOTA DEBUG ===');
          console.log('Plan:', plan.name);
          console.log('Plan charges (raw):', plan.charges);

          const charges = typeof plan.charges === 'string' ? JSON.parse(plan.charges) : plan.charges;
          console.log('Charges (parsed):', charges);

          for (const charge of charges) {
            console.log('Charge:', charge);
            console.log('Charge type:', charge.type);

            // Check for quota in various possible locations
            const quotaValue = charge.entitlementLimit || charge.properties?.quota || charge.quota || charge.properties?.maxUnits;

            if (quotaValue !== undefined && quotaValue !== null && quotaValue !== '' && quotaValue !== 0) {
              console.log('✅ Found quota:', quotaValue, 'for charge:', charge.name);

              let meterOrFeatureName = charge.name;
              let fieldName = null;

              // For entitlement charges, use feature name
              if (charge.type === 'entitlement' && charge.featureId) {
                const feature = await fetch(`http://localhost:3000/api/features`).then(r => r.json());
                const foundFeature = feature.find(f => f.id === charge.featureId);
                if (foundFeature) {
                  meterOrFeatureName = foundFeature.name;
                  fieldName = charge.properties?.featureName || foundFeature.code;
                }
              }

              // For metered charges, find the meter
              let meter = null;
              if (charge.billableMetricId) {
                meter = meters.find(m => m.id === charge.billableMetricId);
                if (meter) {
                  meterOrFeatureName = meter.name;
                  fieldName = meter.field;
                }
              }

              console.log('Meter/Feature:', meterOrFeatureName, 'Field:', fieldName);

              // Calculate current usage - for entitlements, count all matching events
              let currentUsage = 0;

              if (charge.type === 'entitlement') {
                // For entitlements, we need to find events that match this feature
                // This is a simplified approach - you may need to adjust based on how you track feature usage
                const featureName = charge.properties?.featureName || charge.name;

                // Count events that have this feature in their properties
                const matchingEvents = events.filter(e => {
                  try {
                    const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                    // Check if any property value matches the feature name or if there's a specific field
                    return props[featureName] !== undefined || props[fieldName] !== undefined;
                  } catch {
                    return false;
                  }
                });

                // Sum up the usage
                currentUsage = matchingEvents.reduce((sum, e) => {
                  try {
                    const props = typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties;
                    const value = props[featureName] || props[fieldName] || props[charge.name] || 0;
                    return sum + (Number(value) || 0);
                  } catch {
                    return sum;
                  }
                }, 0);

                console.log('Entitlement usage calculated:', currentUsage, 'from', matchingEvents.length, 'events');
              } else if (meter) {

                // Calculate current usage
                const meterEvents = events.filter(e => e.eventSchemaId === meter.eventSchemaId);

                let parsedEvents = meterEvents.map(e => ({
                  ...e,
                  properties: typeof e.properties === 'string' ? JSON.parse(e.properties) : e.properties
                }));

                //Apply filters if any
                if (meter.filter) {
                  try {
                    const rawFilter = typeof meter.filter === 'string' ? JSON.parse(meter.filter) : meter.filter;
                    const filters = Array.isArray(rawFilter) ? rawFilter : [rawFilter];
                    parsedEvents = parsedEvents.filter(event => {
                      return filters.every(filter => {
                        const val = event.properties[filter.key];
                        return String(val) === String(filter.value);
                      });
                    });
                  } catch (e) {
                    // Ignore filter errors
                  }
                }

                if (meter.aggregation === 'count') {
                  currentUsage = parsedEvents.length;
                } else if (meter.aggregation === 'sum' && meter.field) {
                  currentUsage = parsedEvents.reduce((sum, event) => {
                    return sum + (Number(event.properties[meter.field]) || 0);
                  }, 0);
                }
              }

              const quota = Number(quotaValue);
              const remaining = Math.max(0, quota - currentUsage);
              const usagePercent = (currentUsage / quota) * 100;

              quotas.push({
                meterName: meterOrFeatureName,
                field: fieldName,
                currentUsage,
                quota,
                remaining,
                usagePercent: Math.min(usagePercent, 100),
                status: usagePercent >= 100 ? 'exceeded' : usagePercent >= 80 ? 'warning' : 'ok'
              });

              console.log('Added quota:', { meterName: meterOrFeatureName, currentUsage, quota, remaining });
            }
          }
        }

        setQuotaData(quotas);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quota data:', error);
        setQuotaData([]); // Set to empty array on error
        setLoading(false);
      }
    };

    fetchQuotaData();
  }, [accountId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!quotaData || quotaData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Quota & Usage</h3>
        </div>
        <p className="text-sm text-gray-500">No quota limits configured for this account.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">Quota & Usage</h3>
      </div>

      <div className="space-y-5">
        {quotaData.map((quota, idx) => (
          <div key={idx} className="border-b last:border-b-0 pb-5 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {quota.field ? `${quota.meterName} (${quota.field})` : quota.meterName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {quota.currentUsage.toLocaleString()} / {quota.quota.toLocaleString()} used
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${quota.status === 'exceeded'
                ? 'bg-red-100 text-red-800'
                : quota.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                {quota.status === 'exceeded' ? 'Exceeded' : quota.status === 'warning' ? 'Low' : 'OK'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all ${quota.status === 'exceeded'
                  ? 'bg-red-500'
                  : quota.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                  }`}
                style={{ width: `${quota.usagePercent}%` }}
              ></div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                Remaining: <span className="font-medium text-gray-900">{quota.remaining.toLocaleString()}</span>
              </span>
              <span className="text-gray-600">
                <span className="font-medium text-gray-900">{quota.usagePercent.toFixed(1)}%</span> used
              </span>
            </div>

            {quota.status === 'exceeded' && (
              <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 rounded">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">
                  Quota limit exceeded. Further usage may be restricted.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
