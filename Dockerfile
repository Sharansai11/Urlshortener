# Multi-stage build for Railway deployment
FROM maven:3.9-openjdk-21 AS java-builder

# Copy parent pom first
COPY pom.xml /app/pom.xml

# Build create-service
WORKDIR /app/create-service
COPY create-service/pom.xml .
COPY create-service/src ./src
RUN mvn clean package -DskipTests

# Build redirect-service  
WORKDIR /app/redirect-service
COPY redirect-service/pom.xml .
COPY redirect-service/src ./src
RUN mvn clean package -DskipTests

# Frontend build stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Set API URL for production
ENV REACT_APP_API_URL=https://urlshortener-production.up.railway.app
RUN npm run build

# Final runtime stage with embedded database
FROM openjdk:21-jdk-slim

# Install nginx, postgresql, redis
RUN apt-get update && apt-get install -y \
    nginx \
    postgresql \
    redis-server \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy built applications
COPY --from=java-builder /app/create-service/target/create-service-0.0.1-SNAPSHOT.jar /app/create-service.jar
COPY --from=java-builder /app/redirect-service/target/redirect-service-0.0.1-SNAPSHOT.jar /app/redirect-service.jar
COPY --from=frontend-builder /app/frontend/build /var/www/html

# Copy configurations
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY init-db.sql /docker-entrypoint-initdb.d/init-db.sql

# Setup PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER urluser WITH SUPERUSER PASSWORD 'urlpass';" && \
    createdb -O urluser urlshortener

USER root

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]