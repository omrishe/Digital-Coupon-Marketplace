## Why

There is a need to build a backend system for a digital marketplace selling coupon-based products through direct customers (frontend) and external resellers (REST API). We need to support product management, enforce strict pricing rules, and expose a secure API.

## What Changes

- Add a new `Product` entity with a UUID, name, description, type, image URL, and timestamps.
- Add a `Coupon` product type that extends `Product` with pricing fields (cost, margin, derived minimum sell price), a sold status, and a redeemable value (string/image).
- Create a reseller REST API with Bearer token authentication to get available products, get product by ID, and purchase products (with atomic sold marking and price validation).
- Implement an Admin API for CRUD operations on products.
- Enforce business logic such as calculating the minimum sell price server-side and validating atomic purchases.

## Capabilities

### New Capabilities

- `reseller-api`: Endpoints for resellers to query available products and purchase them securely.
- `admin-api`: Endpoints for the admin to create, read, update, and delete products and coupons.
- `product-management`: Core business logic for managing products, coupons, and calculating pricing rules.

### Modified Capabilities

## Impact

- New database schemas for products and coupons.
- New REST API endpoints and authentication layers.
- Core business logic services to enforce pricing and purchase rules.
