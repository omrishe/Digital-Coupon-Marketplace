FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy root package.json and tsconfig
COPY package*.json ./
COPY tsconfig*.json ./

# Copy shared and backend workspaces for dependencies
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies for the whole workspace
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared first, then backend
RUN npm run build -w shared
RUN npm run build -w backend

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install only production dependencies
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/shared/dist ./shared/dist
COPY --from=builder /usr/src/app/backend/dist ./backend/dist

EXPOSE 3000

CMD ["npm", "start", "-w", "backend"]
