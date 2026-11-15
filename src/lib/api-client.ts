// Hello Khata OS - API Client
// হ্যালো খাতা - এপিআই ক্লায়েন্ট

import { useSessionStore } from '@/stores/sessionStore';
import { useUiStore } from '@/stores/uiStore';
import { useBranchStore } from '@/stores/branchStore';
import type { ApiResponse, ApiError } from '@/types';

// Base URL from environment
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';


// Request options type
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  // Override branch context for specific requests
  branchId?: string | null;
}

class ApiClientError extends Error {
  constructor(
    readonly apiError: ApiError,
    readonly status: number,
  ) {
    super(apiError.message);
    this.name = 'ApiClientError';
  }
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// Main API client function
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, branchId: overrideBranchId, ...fetchOptions } = options;
  const url = buildUrl(endpoint, params);

  // Get session data from store
  const sessionState = useSessionStore.getState();
  const token = sessionState.token;
  const language = useUiStore.getState().language;

  // Get branch context from store
  const branchState = useBranchStore.getState();
  // Use override branchId if provided, otherwise use current branch from store
  const branchId = overrideBranchId !== undefined ? overrideBranchId : branchState.currentBranchId;

  // Default headers
  const isFormData =
    typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    'Accept-Language': language,
    ...fetchOptions.headers,
  };

  // Add auth headers if session exists
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Add branch ID for branch-scoped operations
  // null means "All Branches" mode for reporting
  if (branchId !== undefined) {
    (headers as Record<string, string>)['x-branch-id'] = branchId || '';
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      // Handle 401 - Unauthorized
      if (response.status === 401) {
        useSessionStore.getState().logout();
        window.location.reload();
      }

      throw new ApiClientError(
        data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network error
    const networkError: ApiError = {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      messageBn: 'নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আপনার সংযোগ পরীক্ষা করুন।',
    };

    throw new ApiClientError(networkError, 0);
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown, branchId?: string | null) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      branchId,
    }),

  postForm: <T>(endpoint: string, body: FormData, branchId?: string | null) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body,
      branchId,
    }),
};
