const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Extract access token if running in the browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nama_access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    } as HeadersInit,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || 'An unexpected error occurred';
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.code = data?.error?.code || 'API_ERROR';
    error.details = data?.error?.details || [];
    throw error;
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
