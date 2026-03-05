## ADDED Requirements

### Requirement: Minimum Sell Price Calculation

The system SHALL calculate the `minimum_sell_price` server-side dynamically or explicitly derived upon creation/update, using the formula: `minimum_sell_price = cost_price + (cost_price * (margin_percentage / 100))`. The system MUST NOT accept this value from the client.

#### Scenario: Correct price calculation

- **WHEN** a coupon is created with `cost_price` = 80 and `margin_percentage` = 25
- **THEN** the server ensures the `minimum_sell_price` is precisely 100

### Requirement: Prevent Sold Product Override

The system SHALL prevent any operations that would attempt to sell an already-sold product or improperly modify its core pricing once sold.

#### Scenario: Double purchase prevention

- **WHEN** two simultaneous requests are made to purchase the same unsold product
- **THEN** the system must utilize database locks or atomic updates to ensure only one request succeeds, and the other is rejected with a 409 Conflict

### Requirement: Validate Pricing Constraints

The system SHALL ensure that `cost_price` >= 0 and `margin_percentage` >= 0 for any given coupon.

#### Scenario: Negative pricing rejected

- **WHEN** a request attempts to create or update a product with a negative cost_price or margin_percentage
- **THEN** the system rejects the request with a validation error

### Requirement: Purchase Logging

The system SHALL keep an explicit record of all successful purchases in a dedicated `purchases` table.

#### Scenario: Successful purchase logged

- **WHEN** a purchase transaction is successfully completed
- **THEN** the system records the transaction including `product_id`, `channel` (customer|reseller), `price`, `reseller_id` (if applicable), and `created_at`.
