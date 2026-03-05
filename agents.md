You are an expert in TypeScript, Node.js, Express.js, PostgreSQL, Prisma, and RESTful API development.

Tech Stack

    Runtime: Node.js with TypeScript
    Framework: Express.js
    Database: PostgreSQL with TypeORM
    Authentication: JWT (jsonwebtoken) + bcrypt/argon2
    Validation: Zod
    HTTP Client: axios
    Logging: Winston
    Testing: Jest or Vitest
    Security: helmet, express-rate-limit, cors
    Environment: dotenv
    API Docs: Swagger/OpenAPI

Code Style and Structure

    Write concise, technical TypeScript code with accurate examples.
    Use functional programming patterns; avoid classes except for error types.
    Follow DRY (Don't Repeat Yourself) principle; extract reusable logic into shared utilities.
    Use descriptive variable names with auxiliary verbs (e.g., isLocked, hasPermission).
    Structure: routes, controllers, services, repositories, middleware, utils, types.
    Use ES Modules (import/export) instead of CommonJS (require).
    Extract magic numbers and strings to named constants.

    Naming Conventions

    Use lowercase with dashes for directories (e.g., time-entries).
    Use camelCase for variables and functions.
    Use PascalCase for types and interfaces.
    Use SCREAMING_SNAKE_CASE for constants.

TypeScript Usage

    Use TypeScript for all code; prefer interfaces over types.
    Avoid enums; use const objects with as const instead.
    Use strict mode for better type safety.
    Define explicit return types for all functions.
    Use generics for reusable utility functions.

API Design

    Follow RESTful conventions for endpoint naming.
    Use proper HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE.
    Use plural nouns for resources (e.g., /api/users, /api/time-entries).
    Return consistent response structures with status, data, and error fields.
    Use appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
    Version API endpoints (e.g., /api/v1/).
    Implement /health endpoint for container orchestration and monitoring.
    Use axios for HTTP requests to external services.

Request/Response Structure

    Use Zod for request validation in middleware.
    Return standardized JSON responses:

    { success: true, data: {...} }
    { success: false, error: { code: string, message: string } }

Shared DTOs

    Define DTOs (Data Transfer Objects) in a shared folder accessible by client, backend, and admin.
    Use DTOs for all API request and response types.
    Keep DTOs in sync across all three projects (monorepo shared package or npm package).
    DTOs should match Zod schemas for validation consistency.
    Separate DTOs by domain (e.g., user.dto.ts, time-entry.dto.ts, absence.dto.ts).

Authentication and Authorization

    Use HTTP-only cookies for token storage.
    Implement refresh token rotation.
    Create middleware for role-based access control (admin/regular user).
    Hash passwords with bcrypt (minimum 12 rounds).
    Validate all tokens and handle expiry gracefully.

Authorization Rules

    Resellers can only access external APIs with valid Bearer Tokens.
    Admins access endpoints using explicit x-admin-key (for simplicity) but have securely hashed passwords in DB.
    Only Admins can create, update, or delete products and coupons.
    Resellers can only query available products and purchase them.
    Pricing fields (cost prices/margins) are sensitive and must never be exposed to Direct Customers or Resellers.

Database (PostgreSQL with TypeORM)

    Use TypeORM as the ORM for database access (Prisma is explicitly prohibited).
    Implement migrations using TypeORM CLI.
    Define Entities with proper relations (@OneToOne, @ManyToOne, etc.) and constraints.
    Implement soft deletes with @DeleteDateColumn if necessary.
    Use @Index for frequently queried columns.
    Use TypeORM QueryRunner or manager.transaction for atomic multi-table operations (critical for purchases).
    Store timestamps in UTC; use @CreateDateColumn and @UpdateDateColumn.

Query Optimization

    Use TypeORM's select and relations to fetch only required fields.
    Use QueryBuilder for complex queries or raw SQL queries when native performance is required.
    Leverage TypeORM pagination methods (skip/take).

Business Logic

    Strict formula logic: minimum_sell_price = cost_price * (1 + margin_percentage / 100).
    Reseller price MUST be >= minimum_sell_price.
    Purchases must be 100% atomic, locked via DB transaction (e.g., SELECT ... FOR UPDATE) to prevent double purchasing coupons.
    Coupon values are only revealed upon successful purchase.

Error Handling

    Create custom error classes (ValidationError, AuthError, NotFoundError).
    Use centralized error handling middleware.
    Log errors with appropriate context (user, action, timestamp).
    Return user-friendly error messages; hide internal details in production.
    Handle database connection errors gracefully.

Validation

    Validate all inputs at controller level using Zod schemas.
    Sanitize user inputs to prevent injection attacks.
    Validate business rules in service layer.
    Return clear validation error messages.

Logging

    Use structured logging (e.g., Winston or Pino).
    Log all requests with method, path, status, and duration.
    Log authentication events (login, logout, failed attempts).
    Log admin actions on user data for audit trail.
    Use different log levels (debug, info, warn, error).

Security

    Sanitize all user inputs.
    TypeORM handles parameterized queries automatically; avoid raw SQL string interpolation.
    Implement rate limiting on all endpoints.
    Use HTTPS in production.
    Set secure headers (helmet middleware).
    Never expose sensitive data in responses (passwords, cost_price, margin_percentage, coupon values before purchase).

Environment Configuration

    Use environment variables for all configuration.
    Separate configs for development, test, and production.
    Never commit secrets to version control.
    Use .env.example as template.
    Use Zod for environment variable validation with hierarchical config and defaults.

API Documentation

    Document all endpoints with Swagger/OpenAPI.
    Include request/response examples.
    Document authentication requirements.
    Document error responses.

Function Documentation

    Add JSDoc comments above every function with:
        @description - Brief explanation of what the function does
        @param - Each parameter with type and description
        @returns - Return type and description
        @throws - Any errors the function may throw
        @example - Usage example when helpful
    For each new function, create a detailed documentation file in /docs folder:
        File naming: /docs/[module]/[function-name].md
        Include: purpose, parameters table, return value, error scenarios, usage examples, edge cases, related functions.

Performance

    Use connection pooling for database.
    Implement response caching where appropriate.
    Use async/await properly; avoid blocking operations.
    Optimize database queries with proper indexing.

Key Conventions

    All dates/times stored in UTC; convert on response if needed.
    Use transactions for operations affecting multiple tables.
    Implement audit logging for sensitive operations.
    Follow 12-factor app principles.
    Keep controllers thin; business logic in services.
    Repository pattern for database access.

Refer to Express.js,typeorm and PostgreSQL documentation for best practices.
