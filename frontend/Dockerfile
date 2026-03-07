# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json and workspace configurations
COPY package*.json ./
COPY tsconfig.json ./

# Copy the shared package and frontend package configs first for caching
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

# Install dependencies (will install for all workspaces)
RUN npm install

# Copy all the source code for the needed workspaces
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build the shared package first
RUN npm run build -w shared

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Production stage - Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle React Router and API proxying
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
