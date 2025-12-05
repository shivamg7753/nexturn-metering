/**
 * Billable metrics generation
 */

/**
 * Generate billable metrics for usage tracking
 * @returns {Array<Object>} Array of billable metric objects
 */
export const generateBillableMetrics = () => [
    {
        id: 'bm_api_calls',
        name: 'API Calls',
        code: 'api_calls',
        description: 'Number of API requests made',
        aggregationType: 'count',
        recurring: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'bm_storage',
        name: 'Storage',
        code: 'storage_gb',
        description: 'Storage used in GB',
        aggregationType: 'latest',
        fieldName: 'storage_gb',
        recurring: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'bm_users',
        name: 'Active Users',
        code: 'active_users',
        description: 'Unique active users',
        aggregationType: 'count_unique',
        fieldName: 'user_id',
        recurring: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'bm_compute',
        name: 'Compute Hours',
        code: 'compute_hours',
        description: 'Total compute hours used',
        aggregationType: 'sum',
        fieldName: 'duration_hours',
        recurring: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'bm_bandwidth',
        name: 'Bandwidth',
        code: 'bandwidth_gb',
        description: 'Data transferred in GB',
        aggregationType: 'sum',
        fieldName: 'bytes',
        recurring: false,
        createdAt: new Date().toISOString(),
    }
];
