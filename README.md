# URL Shortener Microservices

A scalable URL shortener built with Spring Boot microservices, PostgreSQL, Redis, and React.

## Architecture

- **Create Service** (2 replicas): Handles URL shortening with Snowflake ID + Base62 encoding
- **Redirect Service** (4 replicas): Handles URL redirection with Redis cache hot-path
- **PostgreSQL**: Source of truth database
- **Redis**: Cache layer with 6-hour TTL
- **Nginx**: Load balancer with round-robin
- **React Frontend**: Simple UI for testing

## Features

- 8-character short codes using Snowflake ID + Base62
- Redis hot-path caching for low-latency redirects
- Horizontal scaling with multiple service replicas
- Load balancing across service instances
- Minimal, clean codebase with Lombok

## Quick Start with IntelliJ IDEA

1. **Start infrastructure services:**
   ```bash
   docker-compose up postgres redis nginx
   ```

2. **In IntelliJ IDEA:**
   - Open the main project folder (contains parent pom.xml)
   - Wait for Maven to import modules
   - Run `CreateServiceApplication.java` (will start on port 8080)
   - Run `RedirectServiceApplication.java` (will start on port 8081)

3. **Start frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API Create: http://localhost/api/create
   - API Redirect: http://localhost/api/redirect/{shortCode}

## Load Testing

Run K6 load tests (500 create RPS, 1000 redirect RPS):

```bash
# Install K6 first
k6 run k6-tests/load-test.js
```

## API Endpoints

### Create Short URL
```bash
POST http://localhost/api/create
Content-Type: application/json

{
  "url": "https://example.com/very/long/url"
}

Response:
{
  "shortCode": "A1B2C3D4"
}
```

### Redirect
```bash
GET http://localhost/api/redirect/A1B2C3D4

Response: 302 Found
Location: https://example.com/very/long/url
```

## Services

- **postgres**: Port 5432
- **redis**: Port 6379  
- **nginx**: Port 80
- **frontend**: Port 3000
- **create-service**: Internal (2 replicas)
- **redirect-service**: Internal (4 replicas)

## Performance Targets

- Create: 500 RPS, <100ms p95
- Redirect: 1000 RPS, <50ms p95
- Error rate: <1%