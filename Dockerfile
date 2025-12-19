# Simple single-service approach for Railway
FROM maven:3.9-eclipse-temurin-21 AS java-builder

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
RUN npm run build

# Final runtime stage - simple nginx + static files
FROM nginx:alpine

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Copy nginx config for frontend only
COPY frontend-nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]