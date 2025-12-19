FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source files
COPY . .

# Build argument for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]