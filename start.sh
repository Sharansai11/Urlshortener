#!/bin/bash

# Start create-service in background
java -jar /app/create-service.jar --server.port=8080 &

# Start redirect-service in background  
java -jar /app/redirect-service.jar --server.port=8081 &

# Start nginx in foreground
nginx -g "daemon off;"