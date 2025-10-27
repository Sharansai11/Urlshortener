# URL Shortener

A microservices-based URL shortener built with Spring Boot, PostgreSQL, Redis, and React. The system is designed to handle high-throughput URL creation and redirection with proper caching and load balancing.

## Architecture

The application consists of two main services that handle different aspects of URL shortening:

- **Create Service**: Processes new URL submissions and generates short codes using Snowflake ID generation with Base62 encoding
- **Redirect Service**: Handles URL lookups and redirects with Redis caching for performance
- **PostgreSQL**: Primary database for URL storage
- **Redis**: Caching layer with 6-hour TTL for frequently accessed URLs
- **Nginx**: Load balancer and reverse proxy
- **React Frontend**: Web interface for creating and testing short URLs

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Java 21 (for local development)
- Node.js 18+ (for frontend development)
- Maven 3.8+ (for building services)

### Running the Application

1. **Start all services with Docker:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Web Interface: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Health Check: http://localhost:8080/health

### Development Setup

If you want to run services locally for development:

1. **Start infrastructure:**
   ```bash
   docker-compose up postgres redis nginx
   ```

2. **Build and run services:**
   ```bash
   # Create Service
   cd create-service
   mvn spring-boot:run
   
   # Redirect Service (in another terminal)
   cd redirect-service
   mvn spring-boot:run
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## API Reference

### Create Short URL

Creates a new short URL from a long URL.

```http
POST /api/create
Content-Type: application/json

{
  "url": "https://example.com/some/long/path"
}
```

**Response:**
```json
{
  "shortCode": "jA2kL9mP"
}
```

### Redirect to Original URL

Redirects to the original URL using the short code.

```http
GET /api/redirect/{shortCode}
```

**Response:**
```http
HTTP/1.1 302 Found
Location: https://example.com/some/long/path
```

## Performance Testing

The project includes K6 performance tests for both read and write paths.

### Running Tests

```bash
# Test URL creation (write path)
k6 run k6-tests/write-path-test.js

# Test URL redirection (read path)  
k6 run k6-tests/read-path-test.js
```

### Performance Targets

- **Write Path**: 200 RPS sustained load with <500ms P95 latency
- **Read Path**: 1000 RPS sustained load with <200ms P95 latency
- **Error Rate**: Less than 5% for both paths
- **Cache Hit Rate**: High cache utilization for frequently accessed URLs

## Technical Details

### Short Code Generation

The system uses Snowflake ID generation combined with Base62 encoding to create 8-character short codes. This approach provides:

- Unique ID generation across distributed instances
- Chronologically sortable IDs
- URL-safe characters only
- Collision-free operation

### Caching Strategy

Redis is used as a cache layer with the following configuration:

- **TTL**: 6 hours for cached URLs
- **Memory Policy**: LRU eviction when memory limit is reached
- **Cache-First**: All redirect requests check Redis before hitting the database
- **Write-Through**: New URLs are cached immediately after database insertion

### Database Schema

The application uses a simple schema with a single table:

```sql
CREATE TABLE url (
    short_code VARCHAR(8) PRIMARY KEY,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Service Configuration

### Ports

- **Frontend**: 3000
- **Nginx**: 8080 (external access point)
- **Create Service**: 8080 (internal)
- **Redirect Service**: 8081 (internal)
- **PostgreSQL**: 5433 (mapped from 5432)
- **Redis**: 6379

### Environment Variables

Services can be configured using environment variables:

- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_REDIS_HOST`: Redis host address
- `JAVA_OPTS`: JVM configuration options

## Monitoring

The application includes basic health checks and metrics:

- Health endpoint: `/health`
- Service logs available via `docker-compose logs [service-name]`
- Redis and PostgreSQL connection monitoring

## Development Notes

### Building Services

```bash
# Build all services
mvn clean package

# Build specific service
cd create-service
mvn clean package
```

### Database Migrations

The application uses Hibernate with `ddl-auto: update` for development. For production deployments, consider using proper migration tools like Flyway.

### Adding New Features

The codebase is structured for easy extension:

- Controllers handle HTTP requests and responses
- Services contain business logic
- Repositories manage data access
- Configuration classes handle Spring setup

## Troubleshooting

### Common Issues

**Services not starting:**
- Check if ports are available
- Verify Docker containers are running
- Check service logs for errors

**Frontend CORS errors:**
- Ensure nginx is running and accessible on port 8080
- Verify CORS headers are properly configured

**Database connection issues:**
- Confirm PostgreSQL container is running
- Check database credentials and connection string
- Verify network connectivity between services

**Cache misses:**
- Check Redis container status
- Verify Redis connection configuration
- Monitor cache hit rates in application logs