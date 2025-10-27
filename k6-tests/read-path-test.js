import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const redirectRequests = new Counter('redirect_requests');
const redirectErrors = new Rate('redirect_errors');
const redirectLatency = new Trend('redirect_latency');

export const options = {
  scenarios: {
    read_load: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 250,
      maxVUs: 500,
      stages: [
        { duration: '15s', target: 1000 }, // Ramp to 1000 RPS
        { duration: '45s', target: 1000 }, // Sustain 1000 RPS
        { duration: '10s', target: 0 },    // Ramp down
      ],
      exec: 'readTest',
    },
  },
  thresholds: {
    redirect_errors: ['rate<0.05'],
    redirect_latency: ['p(95)<200'],
  },
};

export function setup() {
  console.log('Setting up test data for read path...');
  const codes = [];

  // Create test URLs for redirect testing
  for (let i = 0; i < 100; i++) {
    const payload = JSON.stringify({
      url: `https://read-test-${i}.example.com`,
    });

    const response = http.post('http://localhost:8080/api/create', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: '15s',
    });

    if (response.status === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data && data.shortCode) {
          codes.push(data.shortCode);
        }
      } catch (e) { }
    }
    sleep(0.1);
  }

  console.log(`Setup complete: ${codes.length} codes ready for read testing`);
  return { codes: codes };
}

export function readTest(data) {
  if (data.codes.length === 0) {
    sleep(0.1);
    return;
  }

  const shortCode = data.codes[Math.floor(Math.random() * data.codes.length)];

  const response = http.get(`http://localhost:8080/api/redirect/${shortCode}`, {
    redirects: 0,
    timeout: '5s',
  });

  redirectRequests.add(1);

  const success = response.status === 302;
  redirectErrors.add(!success);

  if (success) {
    redirectLatency.add(response.timings.duration);
  }

  check(response, { 'redirect_success': (r) => r.status === 302 });
  sleep(0.01);
}

export function handleSummary(data) {
  const duration = data.state.testRunDurationMs / 1000;
  const redirectCount = data.metrics.redirect_requests?.values?.count || 0;
  const redirectErrorRate = (data.metrics.redirect_errors?.values?.rate || 0) * 100;
  const redirectRPS = (redirectCount / duration).toFixed(1);
  const redirectAvg = (data.metrics.redirect_latency?.values?.avg || 0).toFixed(1);
  const redirectP95 = (data.metrics.redirect_latency?.values?.['p(95)'] || 0).toFixed(1);

  console.log(`
READ PATH PERFORMANCE TEST (via Nginx Load Balancer)
===================================================

TEST CONFIGURATION:
- Target: Redirect service read path via nginx:8080
- Cache: Redis with 6-hour TTL hot-path
- Load Pattern: Ramp to 1000 RPS, sustain 45s

READ PATH RESULTS:
  Total Requests: ${redirectCount}
  Sustained RPS: ${redirectRPS}
  Success Rate: ${(100 - redirectErrorRate).toFixed(2)}%
  Avg Latency: ${redirectAvg}ms
  P95 Latency: ${redirectP95}ms
  Test Duration: ${duration.toFixed(1)}s

PERFORMANCE STATUS:
- ${redirectRPS >= 800 ? '✅ EXCELLENT' : redirectRPS >= 600 ? '✅ GOOD' : redirectRPS >= 400 ? '⚠️  MODERATE' : '❌ NEEDS OPTIMIZATION'} RPS Performance
- ${(100 - redirectErrorRate) >= 95 ? '✅ EXCELLENT' : (100 - redirectErrorRate) >= 90 ? '✅ GOOD' : '⚠️  NEEDS IMPROVEMENT'} Reliability
`);

  return { 'stdout': '' };
}