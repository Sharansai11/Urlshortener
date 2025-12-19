# Frontend-only deployment for Railway
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY frontend-nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]