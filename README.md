# Digital Coupon Marketplace

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A full-stack Node.js and React monorepo for a digital coupon marketplace. This project features an administrative portal, a direct customer storefront, and a secure REST API for external resellers.

---

## 🏗 System Architecture & Project Structure

The project is built as an npm workspace monorepo consisting of three main packages:

- **`backend`**: Node.js + Express API powered by TypeORM and PostgreSQL.
  - **Controllers/Services/Entities**: Follows a layered architecture for separation of concerns (`routes` -> `services` -> `entities`).
  - **Concurrency Control**: Implements `pessimistic_write` database locks (via `SELECT ... FOR UPDATE`) during the purchase flow to guarantee atomic transactions and prevent double-spending of single-use coupons.
  - **Error Handling**: Utilizes a centralized error-handling middleware (`AppError`) to ensure all API responses adhere to a strict and predictable JSON format.
  - **Pricing Integrity**: The `minimum_sell_price` is strictly derived server-side via `cost_price × (1 + margin_percentage / 100)` and is never blindly accepted from client input.
- **`frontend`**: React + Vite single-page application.
  - Features a modern glassmorphism UI.
  - Provides a customer storefront for browsing and purchasing products.
  - Provides an Admin dashboard for creating, editing, and managing the coupon inventory.
- **`shared`**: Shared TypeScript definitions (`@repo/shared`) ensuring type-safety contracts between the frontend and backend (e.g., DTOs, Enums, API Error Responses).

---

## 🚀 Quick Start (Dockerized)

The entire application is fully Dockerized and requires no local Node.js or PostgreSQL installations to run.

### 1. Start the System

From the root of the repository, run:

```bash
docker-compose up --build
```

This spins up the PostgreSQL database (`digital-coupon-db`), the Node.js API (`digital-coupon-backend`), and the React Frontend (`assignment-frontend-1`).

### 2. Access the Applications

- **Frontend UI (Customers & Admin)**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

### 3. Initialize the Admin User

The database starts empty. To access the Admin Dashboard, you must register your first admin user via the API. This endpoint is securely protected by a one-time secret key (`x-admin-secret`), which defaults to `supersecretadmin` for local development.

Run the following cURL command to initialize an admin user:

```bash
curl -X POST http://localhost:3000/admin/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: supersecretadmin" \
  -d '{"username": "admin", "password": "securepassword123"}'
```

_Next, navigate to `http://localhost:8080/admin/login` and log in with those credentials to start creating products!_

---

## 💻 Local Development Without Docker

If you prefer to run the system natively for development:

1. **Start the Database**:
   ```bash
   docker-compose up db -d
   ```
2. **Install Dependencies**:
   From the root folder run:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Ensure you have a `.env` file in the `backend` directory (matching `.env.example`).
4. **Run Backend (Port 3000)**:
   ```bash
   cd backend
   npm run build
   npm run typeorm migration:run -- -d ./build/data-source.js
   npm run dev
   ```
5. **Run Frontend (Port 8080)**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🧪 Testing

The backend includes a comprehensive suite of integration tests covering admin creation, product management, pricing rules, atomic purchasing, and the reseller API. The tests spin up their own DB connection and clean up afterward.

```bash
cd backend
npm install
npm test
```

---

## 📚 API Reference

All API responses follow a strict format.

- **Success**: `{ "data": [...] }` or unstructured object `{ ...data }`
- **Error**: `{ "error": { "code": "STRING", "message": "Reasoning" } }`

### Reseller API (`/api/v1`)

Integrators can resell coupons at a markup via these endpoints.
_Requires Header: `Authorization: Bearer <token>`_

- `GET /api/v1/products` - List available products (hides original cost and margin).
- `GET /api/v1/products/:id` - Get a specific product.
- `POST /api/v1/products/:id/purchase` - Purchase a product.
  - Requires `{ "reseller_price": Number }` in the body.
  - **Rules**: Rejects if `reseller_price < minimum_sell_price`. Returns `value` only on success.

### Customer Store API (`/api/v1/store`)

Direct customers purchase coupons exactly at the `minimum_sell_price`.

- `POST /api/v1/store/auth/register` - Register customer account.
- `POST /api/v1/store/auth/login` - Login customer.
- `GET /api/v1/store/products` - List public products.
- `POST /api/v1/store/products/:id/purchase` - Buy a product natively.

### Admin API (`/admin`)

For managing the platform's inventory and checking full product statistics.
_Requires Header: `Authorization: Bearer <Admin_JWT>`_

- `POST /admin/auth/register` - Create an admin (Requires `x-admin-secret` header).
- `POST /admin/auth/login` - Login admin.
- `GET /admin/products` - View all products including sold status, cost prices, and margins.
- `POST /admin/products` - Create new coupon.
- `PUT /admin/products/:id` - Edit a coupon.
- `DELETE /admin/products/:id` - Delete a coupon.
