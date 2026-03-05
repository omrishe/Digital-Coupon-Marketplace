## ADDED Requirements

### Requirement: Admin Authentication

The system SHALL require administrative authentication for all Admin API endpoints.

#### Scenario: Unauthorized admin access

- **WHEN** a client requests an admin endpoint without valid admin credentials
- **THEN** the system returns a 401 Unauthorized or 403 Forbidden error

### Requirement: Create Product/Coupon

The system SHALL allow an administrator to create a new product of type Coupon, specifying its name, description, image_url, cost_price, margin_percentage, and the coupon value.

#### Scenario: Successful coupon creation

- **WHEN** an administrator provides valid data for a new coupon
- **THEN** the system creates the coupon, correctly calculates and stores the `minimum_sell_price` (implicitly or explicitly), marks `is_sold` as false, and returns the created coupon details

### Requirement: View Products

The system SHALL allow an administrator to list all products, including their full details (cost price, margin, sale status).

#### Scenario: Admin views all products

- **WHEN** an administrator requests the list of all products
- **THEN** the system returns a complete list of products without omitting sensitive pricing information

### Requirement: Update Product

The system SHALL allow an administrator to update mutable fields of a product (e.g., name, description, image, or pricing if not yet sold).

#### Scenario: Successful product update

- **WHEN** an administrator updates a product's name and description
- **THEN** the system updates those fields and returns the modified product

### Requirement: Delete Product

The system SHALL allow an administrator to delete a product.

#### Scenario: Successful product deletion

- **WHEN** an administrator deletes a product by its ID
- **THEN** the system removes the product from the database or soft-deletes it and returns a success status
