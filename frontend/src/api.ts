import type {
  ApiResponse,
  AuthMeResponse,
  PublicProduct,
  AdminProduct,
} from '@repo/shared/src/index';

// API URLs
const API_BASE = '/api/v1';
const ADMIN_BASE = '/admin';

const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

/**
 * Standardized error representation
 */
export class ApiError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(statusCode: number, errorCode: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'ApiError';
  }
}

/**
 * Helper to parse standard API error responses
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    //incase of no json in response
    const errorBody = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      errorBody.error_code || 'UNKNOWN_ERROR',
      errorBody.message || res.statusText,
    );
  }
  return res.json() as Promise<T>;
}

// ─── Customer Endpoints ──────────────────────────────────────────────────────────

export const CustomerApi = {
  /** Get all available products (unsold) */
  getAvailableProducts: async (page = 1, limit = 20) => {
    const res = await fetchWithCredentials(
      `${API_BASE}/store/products?page=${page}&limit=${limit}`,
    );
    return handleResponse<{ data: PublicProduct[]; page: number; total_pages: number }>(res);
  },

  /** Purchase a product */
  purchaseProduct: async (productId: string) => {
    const res = await fetchWithCredentials(`${API_BASE}/store/products/${productId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{ value: string }>(res);
  },

  /** Customer Auth */
  login: async (username: string, passwordRaw: string) => {
    const res = await fetchWithCredentials(`${API_BASE}/store/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwordRaw }),
    });
    return handleResponse<ApiResponse>(res);
  },
  register: async (username: string, passwordRaw: string) => {
    const res = await fetchWithCredentials(`${API_BASE}/store/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwordRaw }),
    });
    return handleResponse<ApiResponse>(res);
  },
  logout: async () => {
    const res = await fetchWithCredentials(`${API_BASE}/store/auth/logout`, { method: 'POST' });
    return handleResponse<ApiResponse>(res);
  },
  checkAuth: async () => {
    const res = await fetchWithCredentials(`${API_BASE}/store/auth/me`);
    return handleResponse<AuthMeResponse>(res);
  },
};

// ─── Admin Endpoints ─────────────────────────────────────────────────────────────

export const AdminApi = {
  /** Check if backend recognizes our cookie session */
  checkAuth: async () => {
    const res = await fetchWithCredentials(`${ADMIN_BASE}/auth/me`);
    return handleResponse<AuthMeResponse>(res);
  },

  /** Login to get cookie */
  login: async (username: string, password: string) => {
    const res = await fetchWithCredentials(`${ADMIN_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<ApiResponse>(res);
  },

  /** Clear the admin token cookie */
  logout: async () => {
    const res = await fetchWithCredentials(`${ADMIN_BASE}/auth/logout`, { method: 'POST' });
    return handleResponse<ApiResponse>(res);
  },

  /** Get all products (including sold ones and pricing details) */
  getAllProducts: async (page = 1, limit = 20) => {
    const res = await fetchWithCredentials(`${ADMIN_BASE}/products?page=${page}&limit=${limit}`);
    return handleResponse<{ data: AdminProduct[]; page: number; total_pages: number }>(res);
  },

  /** Create a new product/coupon */
  createProduct: async (productData: any) => {
    const res = await fetchWithCredentials(`${ADMIN_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse<AdminProduct>(res);
  },
};
