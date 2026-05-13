const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const KEY_FILE = '/root/.openclaw/workspace/project/finegrain/.ga-service-account.json';

async function run() {
  const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });

  // Check last 7 days
  const [r] = await client.runReport({
    property: 'properties/514327854',
    dateRanges: [{ startDate: '2026-04-17', endDate: '2026-04-24' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
  });

  console.log('===== GoTaskMind 4/17-24 =====');
  if (r.rows && r.rows.length > 0) {
    r.rows.forEach(row => {
      console.log(`${row.dimensionValues[0].value}: sessions=${row.metricValues[0].value} users=${row.metricValues[1].value} views=${row.metricValues[2].value}`);
    });
  } else {
    console.log('无数据 (last 7 days)');
  }

  // Check all events in last 7 days
  const [e] = await client.runReport({
    property: 'properties/514327854',
    dateRanges: [{ startDate: '2026-04-17', endDate: '2026-04-24' }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    limit: 20,
  });

  console.log('\n----- GoTaskMind Events (4/17-24) -----');
  if (e.rows && e.rows.length > 0) {
    e.rows.forEach(row => {
      console.log(`  ${row.dimensionValues[0].value}: ${row.metricValues[0].value}`);
    });
  } else {
    console.log('无事件');
  }
}

run().catch(console.error);
