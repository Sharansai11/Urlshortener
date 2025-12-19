# RAILWAY DEPLOYMENT - Frontend Only
FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy all frontend files
COPY frontend/ .

# Build the React app
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

EXPOSE 3000

# Serve the built React app
CMD ["serve", "-s", "build", "-l", "3000"]