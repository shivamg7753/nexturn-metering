/**
 * Legacy generator.js - Re-exports from modular structure
 * Maintained for backward compatibility
 * @deprecated Import from './generator/index' instead
 */

// Re-export everything from the new modular structure
export {
  generateSeedData,
  generateBillableMetrics,
  generatePlans,
  generateCustomers,
  generateSubscriptions,
  generateHistoricalEvents,
  generateHistoricalInvoices,
  generateEvents,
  generateAddress,
} from './generator/index';
