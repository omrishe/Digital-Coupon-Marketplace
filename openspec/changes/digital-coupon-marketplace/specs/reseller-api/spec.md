## ADDED Requirements

### Requirement: Get Available Products

The system SHALL expose an endpoint for resellers to list all available (unsold) products. The response MUST NOT include cost price or margin percentage.

#### Scenario: Successful retrieval of unsold products

- **WHEN** a reseller requests the available products list with a valid Bearer token
- **THEN** the system returns a 200 OK with a list of unsold products containing id, name, description, image_url, and the derived minimum sell price
- **AND** the response includes pagination metadata (`data`, `page`, `total_pages`)

#### Scenario: Unauthorized access

- **WHEN** a request is made without a valid Bearer token
- **THEN** the system returns a 401 Unauthorized error

### Requirement: Get Product by ID

The system SHALL expose an endpoint to retrieve details of a specific product by its ID.

#### Scenario: Product found

- **WHEN** a reseller requests a valid product ID
- **THEN** the system returns a 200 OK with the product details

#### Scenario: Product not found

- **WHEN** a reseller requests an invalid or non-existent product ID
- **THEN** the system returns a 404 Not Found error with error code PRODUCT_NOT_FOUND

### Requirement: Purchase Product

The system SHALL expose an endpoint for resellers to purchase a product by providing a reseller price.

#### Scenario: Successful purchase

- **WHEN** a reseller requests to purchase a product and the provided `reseller_price` is >= the calculated `minimum_sell_price`
- **THEN** the system atomically marks the product as sold and returns a 200 OK with the coupon value

#### Scenario: Price too low

- **WHEN** a reseller requests to purchase a product but the `reseller_price` is < the `minimum_sell_price`
- **THEN** the system rejects the purchase and returns a 400 Bad Request with error code RESELLER_PRICE_TOO_LOW

#### Scenario: Product already sold

- **WHEN** a reseller attempts to purchase a product that has already been purchased
- **THEN** the system rejects the purchase and returns a 409 Conflict with error code PRODUCT_ALREADY_SOLD
