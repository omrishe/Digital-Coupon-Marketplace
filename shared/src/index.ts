// ─── Common ───────────────────────────────────────────────────────────────────

/**
 * Standard error response shape ALL API errors must use this format.
 * Spec: { "error_code": "ERROR_NAME", "message": "Human readable message" }
 */
export interface ApiErrorResponse {
  error_code: string;
  message: string;
}

/** Well-known error codes defined by the spec */
export type ApiErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_ALREADY_SOLD'
  | 'RESELLER_PRICE_TOO_LOW'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'USER_ALREADY_EXISTS';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total_pages: number;
}

// ─── Product / Coupon ────────────────────────────────────────────────────────

export type ProductType = 'COUPON';
export type CouponValueType = 'STRING' | 'IMAGE';

/**
 * Public-facing product shape (reseller GET /api/v1/products).
 * Must NOT include cost_price, margin_percentage, or coupon value.
 * Spec fields: id, name, description, image_url, price
 */
export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number; // equals minimum_sell_price
}

/**
 * Full admin product view — includes all pricing and inventory fields.
 */
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  type: ProductType;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  value_type: CouponValueType;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Admin API Requests ───────────────────────────────────────────────────────

export interface CreateCouponRequest {
  name: string;
  description: string;
  image_url: string;
  cost_price: number;
  margin_percentage: number;
  value_type: CouponValueType;
  value: string;
}

export interface UpdateCouponRequest {
  name?: string;
  description?: string;
  image_url?: string;
  cost_price?: number;
  margin_percentage?: number;
  value_type?: CouponValueType;
  value?: string;
}

// ─── Reseller API Requests ────────────────────────────────────────────────────

export interface PurchaseRequest {
  reseller_price: number;
}

/**
 * Purchase success response.
 * Spec: { product_id, final_price, value_type, value }
 */
export interface PurchaseResponse {
  product_id: string;
  final_price: number;
  value_type: CouponValueType;
  value: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * The decoded payload of a reseller JWT.
 * Must include reseller_id per spec.
 */
export interface ResellerJwtPayload {
  reseller_id: string;
  iat?: number;
  exp?: number;
}

/**
 * Generic success response for simple operations (e.g., Logout, Register).
 */
export interface ApiResponse {
  success: boolean;
  message: string;
}

/**
 * Response for authentication checks (/admin/auth/me or /store/auth/me).
 */
export interface AuthMeResponse {
  authenticated: boolean;
  adminId?: string;
  userId?: string;
}
