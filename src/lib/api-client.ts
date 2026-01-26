// ============================================
// API Client with Timeout & Error Handling
// ============================================

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public endpoint?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Custom error class for timeout errors
 */
export class TimeoutError extends Error {
    constructor(message: string = 'Request timeout') {
        super(message);
        this.name = 'TimeoutError';
    }
}

/**
 * Fetch wrapper with timeout and better error handling
 */
export const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeoutMs: number = 10000
): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        console.log('response from fetchWithTimeout: ', response);

        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new TimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`);
            }
            throw new ApiError(error.message, undefined, url);
        }

        throw new ApiError('Unknown error occurred', undefined, url);
    }
};

/**
 * Helper to parse JSON response with error handling
 */
export const parseJsonResponse = async <T = any>(response: Response): Promise<T> => {
    try {
        return await response.json();
    } catch (error) {
        throw new ApiError('Failed to parse response JSON', response.status, response.url);
    }
};

/**
 * Create authorized headers with token
 */
export const createAuthHeaders = (token: string): HeadersInit => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
