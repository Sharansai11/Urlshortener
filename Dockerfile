# RAILWAY DEPLOYMENT - Frontend Only
FROM node:18-alpine

WORKDIR /app

# Copy frontend files
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

EXPOSE 3000

# Serve the built React app
CMD ["serve", "-s", "build", "-l", "3000"]