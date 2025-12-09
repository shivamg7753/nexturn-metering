export const calculateUsage = (
  events,
  metric,
  periodStart,
  periodEnd
) => {
  // 1. Filter events by code
  const metricEvents = events.filter(e => e.code === metric.code);

  // 2. Filter events by time period
  const periodEvents = metricEvents.filter(e => {
    const eventDate = new Date(e.timestamp);
    return eventDate >= periodStart && eventDate <= periodEnd;
  });

  // 3. Apply aggregation
  switch (metric.aggregationType) {
    case 'count':
      return periodEvents.length;

    case 'sum':
      return periodEvents.reduce((sum, e) => {
        const value = e.properties[metric.fieldName || ''] || 0;
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);

    case 'max':
      if (periodEvents.length === 0) return 0;
      return Math.max(...periodEvents.map(e => {
        const value = e.properties[metric.fieldName || ''] || 0;
        return typeof value === 'number' ? value : 0;
      }));

    case 'unique_count':
      const uniqueValues = new Set(periodEvents.map(e => e.properties[metric.fieldName || '']));
      return uniqueValues.size;

    default:
      return 0;
  }
};

