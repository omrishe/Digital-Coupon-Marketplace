FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install -w backend

COPY . .

# Assuming a build script exists, e.g., "build": "tsc" in backend/package.json
RUN npm run build -w backend

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install -w backend --only=production

COPY --from=builder /usr/src/app/backend/dist ./backend/dist

EXPOSE 3000

CMD ["npm", "start", "-w", "backend"]
