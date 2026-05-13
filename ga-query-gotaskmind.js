const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const path = require('path');

const KEY_FILE = '/root/.openclaw/workspace/project/finegrain/.ga-service-account.json';

async function runQuery(propertyId, siteName) {
  const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-04-23', endDate: '2026-04-24' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    console.log(`\n===== ${siteName} (4/23-24) =====`);
    if (response.rows && response.rows.length > 0) {
      for (const row of response.rows) {
        const date = row.dimensionValues[0].value;
        const m = row.metricValues;
        console.log(`日期: ${date}`);
        console.log(`  会话: ${m[0].value} | 用户: ${m[1].value} | 新用户: ${m[2].value}`);
        console.log(`  页面浏览: ${m[3].value} | 平均时长: ${parseFloat(m[4].value).toFixed(1)}s | 跳出率: ${(parseFloat(m[5].value) * 100).toFixed(1)}%`);
      }
    } else {
      console.log('无数据');
    }
  } catch (e) {
    console.log(`${siteName} 查询失败: ${e.message}`);
  }
}

async function runTopPages(propertyId, siteName) {
  const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-04-23', endDate: '2026-04-24' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    console.log(`\n----- ${siteName} 热门页面 -----`);
    if (response.rows && response.rows.length > 0) {
      for (const row of response.rows) {
        console.log(`  ${row.dimensionValues[0].value} → 浏览:${row.metricValues[0].value} 用户:${row.metricValues[1].value}`);
      }
    } else {
      console.log('无数据');
    }
  } catch (e) {
    console.log(`${siteName} 页面查询失败: ${e.message}`);
  }
}

async function runSource(propertyId, siteName) {
  const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '2026-04-23', endDate: '2026-04-24' }],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    console.log(`\n----- ${siteName} 流量来源 -----`);
    if (response.rows && response.rows.length > 0) {
      for (const row of response.rows) {
        console.log(`  ${row.dimensionValues[0].value}: ${row.metricValues[0].value} 会话`);
      }
    } else {
      console.log('无数据');
    }
  } catch (e) {
    console.log(`${siteName} 来源查询失败: ${e.message}`);
  }
}

(async () => {
  await runQuery('514327854', 'GoTaskMind');
  await runTopPages('514327854', 'GoTaskMind');
  await runSource('514327854', 'GoTaskMind');
})();
