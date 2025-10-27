import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const createRequests = new Counter('create_requests');
const createErrors = new Rate('create_errors');
const createLatency = new Trend('create_latency');

export const options = {
  scenarios: {
    write_load: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 80,
      maxVUs: 160,
      stages: [
        { duration: '15s', target: 200 }, // Ramp to 200 RPS
        { duration: '45s', target: 200 }, // Sustain 200 RPS
        { duration: '10s', target: 0 },   // Ramp down
      ],
      exec: 'writeTest',
    },
  },
  thresholds: {
    create_errors: ['rate<0.05'],
    create_latency: ['p(95)<500'],
  },
};

export function writeTest() {
  const payload = JSON.stringify({
    url: `https://write-test-${Math.random().toString(36).substring(7)}.example.com`,
  });

  const response = http.post('http://localhost:8080/api/create', payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
  });

  createRequests.add(1);
  
  const success = response.status === 200;
  createErrors.add(!success);
  
  if (success) {
    createLatency.add(response.timings.duration);
  }

  check(response, { 'create_success': (r) => r.status === 200 });
  sleep(0.05);
}

export function handleSummary(data) {
  const duration = data.state.testRunDurationMs / 1000;
  const createCount = data.metrics.create_requests?.values?.count || 0;
  const createErrorRate = (data.metrics.create_errors?.values?.rate || 0) * 100;
  const createRPS = (createCount / duration).toFixed(1);
  const createAvg = (data.metrics.create_latency?.values?.avg || 0).toFixed(1);
  const createP95 = (data.metrics.create_latency?.values?.['p(95)'] || 0).toFixed(1);

  console.log(`
WRITE PATH PERFORMANCE TEST (via Nginx Load Balancer)
====================================================

TEST CONFIGURATION:
- Target: Create service write path via nginx:8080
- Database: PostgreSQL with connection pooling
- Load Pattern: Ramp to 200 RPS, sustain 45s

WRITE PATH RESULTS:
  Total Requests: ${createCount}
  Sustained RPS: ${createRPS}
  Success Rate: ${(100 - createErrorRate).toFixed(2)}%
  Avg Latency: ${createAvg}ms
  P95 Latency: ${createP95}ms
  Test Duration: ${duration.toFixed(1)}s

PERFORMANCE STATUS:
- ${createRPS >= 180 ? '✅ EXCELLENT' : createRPS >= 150 ? '✅ GOOD' : createRPS >= 100 ? '⚠️  MODERATE' : '❌ NEEDS OPTIMIZATION'} RPS Performance
- ${(100 - createErrorRate) >= 95 ? '✅ EXCELLENT' : (100 - createErrorRate) >= 90 ? '✅ GOOD' : '⚠️  NEEDS IMPROVEMENT'} Reliability
`);

  return { 'stdout': '' };
}