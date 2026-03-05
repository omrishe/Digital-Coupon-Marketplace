## Context

The digital coupon marketplace requires a backend system to manage sellable products, specifically digital coupons. The system needs to support direct purchases via a frontend and integrate with external resellers via a secure REST API. A key constraint is the strict enforcement of pricing rules, where the minimum sell price must be calculated server-side based on the cost price and margin percentage. The system must be fully Dockerized and use a database for persistence.

## Goals / Non-Goals

**Goals:**

- Provide a robust REST API for external resellers with Bearer token authentication.
- Provide an Admin API for managing products and coupons.
- Enforce business logic for calculating `minimum_sell_price` and validating purchases (reseller price >= minimum sell price).
- Ensure atomic operations when marking a coupon as sold to prevent double-spending.
- Expose the necessary endpoints to support a minimal frontend for direct customers and admin users.

**Non-Goals:**

- Building a complex, feature-rich frontend application.
- Integrating with actual payment gateways (purchases are simulated/validated without real financial transactions).
- Implementing complex user roles and permissions beyond basic Admin vs. Reseller vs. Direct Customer distinction.

## Decisions

- **Architecture:** We will adopt a standard Layered Architecture (Controllers, Services, Repositories). This promotes separation of concerns, makes the code easier to test, and aligns with the requirements of the exercise.
- **Database:** PostgreSQL will be used as the database. It provides strong ACID guarantees, which is critical for the atomic purchase operations required (marking a coupon as sold). It also has good support for UUIDs and timestamps.
- **Language/Framework:** Node.js with Express (or NestJS for a more formalized structure, but Express is lighter for this exercise) and TypeScript for type safety.
- **ORM:** TypeORM or raw PostgreSQL queries. (Prisma has been explicitly excluded from the design).
- **Atomic Operations:** Rely on database transactions and specific update queries (e.g., `UPDATE coupons SET is_sold = true WHERE id = ? AND is_sold = false`) to ensure atomic purchases and prevent race conditions.
- **Authentication:** Use JWT (JSON Web Tokens) for the Reseller Bearer tokens. The JWT payload must contain the user/reseller ID, and can be extended with additional claims as needed.
- **Security:** Passwords (e.g., for Admin or Reseller accounts) must be securely hashed (using bcrypt or argon2) before being saved to the database. Plain text passwords shall never be saved.

## Risks / Trade-offs

- [Concurrency/Race Conditions] → Mitigation: Use database-level optimistic or pessimistic locking (e.g., the specific `UPDATE` statement mentioned above, or `SELECT ... FOR UPDATE` within a transaction) precisely when marking a product as sold.
- [Pricing Calculation Errors] → Mitigation: Ensure the `minimum_sell_price` calculation is strictly encapsulated within the service layer and never accepted from the client or stored directly if it can be dynamically derived (though caching it is an option, it's safer to calculate or rely on a stored trigger/generated column if supported by the DB, but server-side calculation on read/write is sufficient and often simpler to maintain logic for).
- [API Security] → Mitigation: Implement standard security middleware (e.g., Helmet, rate limiting) and strictly validate all incoming payloads (e.g., using Zod or class-validator).
