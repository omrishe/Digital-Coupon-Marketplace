# Digital Coupon Marketplace

Backend exercise implementing a digital marketplace that sells coupon-based products through two channels:

1. Direct customers (via frontend)
2. External resellers (via REST API)

The project focuses on **backend architecture, business rules enforcement, atomic operations, and API design**.

---

# Tech Stack

Backend

* Node.js
* TypeScript
* Express
* TypeORM
* PostgreSQL

Frontend

* React

Infrastructure

* Docker
* Docker Compose

Authentication

* Bearer Token (for reseller API)
* Simple Admin API Key (for admin operations)

---

# Architecture Overview

The system is designed using a layered backend architecture:

Controllers → Services → Repositories → Database

```
Controller
   ↓
Service (business logic)
   ↓
Repository (database access)
   ↓
PostgreSQL
```

Responsibilities:

Controller
Handles HTTP requests and responses.

Service
Contains business logic such as pricing validation and purchase logic.

Repository
Handles database queries using TypeORM.

---

# Domain Model

## Product (Base Entity)

Represents a sellable item.

Fields

```
id (UUID)
name (string)
description (string)
type (enum)
image_url (string)
created_at (timestamp)
updated_at (timestamp)
```

The system is designed so additional product types can be added in the future.

---

## Coupon (Product Type)

Coupon extends Product and represents a digital redeemable asset.

Fields

```
product_id (FK → product.id)
cost_price (decimal)
margin_percentage (decimal)
minimum_sell_price (decimal)
value_type (STRING | IMAGE)
value (text)
is_sold (boolean)
```

### Pricing Rules

The minimum sell price **must be calculated in the backend**.

```
minimum_sell_price = cost_price * (1 + margin_percentage / 100)
```

Example

```
cost_price = 80
margin = 25%

minimum_sell_price = 100
```

Rules

* cost_price ≥ 0
* margin_percentage ≥ 0
* pricing fields are **never accepted from external clients**

---

# Database Design

Two main tables are used.

## products

```
id
name
description
type
image_url
created_at
updated_at
```

## coupons

```
product_id
cost_price
margin_percentage
minimum_sell_price
value_type
value
is_sold
```

This structure allows:

* product polymorphism
* clean joins
* adding future product types

---

# Selling Channels

## Direct Customer (Frontend)

Customers purchase through the website.

Rules

* Display price = minimum_sell_price
* Customer cannot override price

Purchase flow

1. Validate product exists
2. Validate product not sold
3. Atomically mark product as sold
4. Return coupon value

---

## Reseller API

Resellers purchase through REST API.

Validation rules

```
reseller_price ≥ minimum_sell_price
```

If the price is lower, the request is rejected.

Successful purchase returns the coupon value.

---

# Authentication

## Reseller API

Uses Bearer Token authentication.

Example

```
Authorization: Bearer <token>
```

Invalid or missing token returns:

```
401 Unauthorized
```

---

## Admin API

Admin operations use a simple API key.

Example

```
x-admin-key: ADMIN_SECRET_KEY
```

Used for:

* Creating coupons
* Updating coupons
* Deleting coupons
* Viewing inventory

---

# API Design

## Get Available Products

```
GET /api/v1/products
```

Returns unsold products.

Response

```
[
  {
    "id": "uuid",
    "name": "Amazon $100 Coupon",
    "description": "Gift card",
    "image_url": "...",
    "price": 100
  }
]
```

Pagination will be supported.

Example

```
GET /api/v1/products?page=1&limit=20
```

---

## Get Product By ID

```
GET /api/v1/products/{id}
```

Returns a single product.

Errors

```
404 PRODUCT_NOT_FOUND
```

---

## Purchase Product (Reseller)

```
POST /api/v1/products/{id}/purchase
```

Request

```
{
  "reseller_price": 120
}
```

Server performs:

* authentication
* product validation
* price validation
* atomic purchase

Response

```
{
  "product_id": "uuid",
  "final_price": 120,
  "value_type": "STRING",
  "value": "ABCD-1234"
}
```

---

# Atomic Purchase Handling

To prevent race conditions, purchases are handled inside a **database transaction**.

Example logic

```
BEGIN TRANSACTION

SELECT coupon WHERE id = ? FOR UPDATE

IF sold → throw error

UPDATE coupon SET is_sold = true

COMMIT
```

This guarantees **only one buyer can purchase a coupon**.

---

# Purchase Logging

Every purchase is recorded.

Table: purchases

```
id
product_id
channel (customer | reseller)
price
reseller_id (nullable)
created_at
```

This enables:

* auditing
* revenue tracking
* reseller analytics

---

# Coupon Value Types

Coupons can contain:

STRING
Example

```
ABCD-1234
```

IMAGE

Base64 encoded image containing barcode or QR code.

Example

```
data:image/png;base64,iVBORw0KGgoAAA...
```

Coupon value is returned **only after successful purchase**.

---

# Admin Flow

Admin uploads coupons into the system.

Admin sets:

```
cost_price
margin_percentage
image_url
coupon_value
value_type
```

The backend calculates:

```
minimum_sell_price
```

---

# Frontend

A minimal React frontend includes two modes.

## Admin Mode

* Create coupon
* View coupons

## Customer Mode

* View available coupons
* Purchase coupon

UI complexity is intentionally minimal.

---

# Pagination

Supported on product listing endpoints.

Example

```
GET /products?page=1&limit=20
```

Response includes metadata

```
{
  "data": [...],
  "page": 1,
  "total_pages": 10
}
```

---

# Docker

The entire system runs with Docker.

Services

```
backend
frontend
postgres
```

Run project

```
docker-compose up --build
```

---

# Security Considerations

* Pricing fields hidden from public APIs
* Coupon value revealed only after purchase
* Authentication for reseller endpoints
* Admin endpoints protected by API key
* Atomic purchase transactions
* Input validation on all endpoints

---

# Possible Future Improvements

* Reseller accounts and JWT authentication
* Rate limiting
* Coupon expiration dates
* Inventory bulk uploads
* Payment integration
* Event-driven purchase processing
* Redis caching for product listings

---

# Project Goal

Demonstrate:

* strong backend architecture
* clear domain modeling
* strict business rule enforcement
* safe concurrent transactions
* clean API design
* production-ready project structure
