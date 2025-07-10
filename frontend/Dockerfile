# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app
COPY . .

# RUN npm ci
RUN npm install
RUN npm run build:ignore-errors

# Stage 2: Serve static files
FROM nginx:stable-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Optionally add a custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
