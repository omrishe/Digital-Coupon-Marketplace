## 1. Project Setup

- [x] 1.1 Initialize a new npm monorepo (workspaces) with `backend` and `frontend` folders
- [x] 1.2 Setup ESLint, Prettier, and TypeScript configuration for the workspaces
- [x] 1.3 Install necessary dependencies (Express, DB driver, validation libs, JWT)
- [x] 1.4 Setup Dockerfile and docker-compose.yml for backend and database

## 2. Database & Models

- [x] 2.1 Design database schema for `Product`, `Coupon`, and `Purchase` tables
- [x] 2.2 Configure ORM or DB client (e.g., TypeORM or direct pg - do not use Prisma)
- [x] 2.3 Create initial database migrations
- [x] 2.4 Implement model interfaces/types mapping to DB schema

## 3. Core Business Logic (Product Management)

- [x] 3.1 Implement service to strictly calculate `minimum_sell_price`
- [x] 3.2 Implement coupon purchase logic with atomic update and status check
- [x] 3.3 Add unit tests for `minimum_sell_price` calculation

## 4. Admin API

- [x] 4.1 Implement basic Admin Authentication middleware (ensure passwords are hashed with bcrypt before saving)
- [x] 4.2 Create `POST /admin/products` endpoint for creating products/coupons
- [x] 4.3 Create `GET /admin/products` endpoint with full details (Implement Pagination)
- [x] 4.4 Create `PUT /admin/products/:id` endpoint for updates
- [x] 4.5 Create `DELETE /admin/products/:id` endpoint
- [x] 4.6 Write integration tests for Admin API endpoints

## 5. Reseller API

- [ ] 5.1 Implement Reseller Bearer Token Authentication middleware (ensure JWT payload includes the reseller ID)
- [ ] 5.2 Create `GET /api/v1/products` endpoint (filtering out sold, hiding sensitive data, implementing Pagination)
- [ ] 5.3 Create `GET /api/v1/products/:id` endpoint
- [ ] 5.4 Create `POST /api/v1/products/:id/purchase` endpoint enforcing price validation and atomic locks
- [ ] 5.5 Validate that the `/purchase` endpoint logs a record into the `purchases` table upon success
- [x] 5.6 Create shared error handling middleware adhering to standard API response format
- [ ] 5.6 Write integration tests for Reseller API endpoints

## 6. Minimal Frontend

- [ ] 6.1 Setup a lightweight Vite + React (or plain HTML/JS) frontend project
- [ ] 6.2 Build 'Admin Mode' UI (Product creation form, list view)
- [ ] 6.3 Build 'Customer Mode' UI (Available products grid, purchase button)
- [ ] 6.4 Integrate frontend with the backend REST API
- [ ] 6.5 Dockerize frontend via Nginx or serve statically from the backend

## 7. Final Polish

- [ ] 7.1 Verify full system startup via docker-compose
- [ ] 7.2 Run through all frontend flows ensuring backend rules are enforced
- [ ] 7.3 Write comprehensive README.md with startup instructions and API docs
