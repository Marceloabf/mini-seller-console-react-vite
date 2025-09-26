export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static instance: ApiClient;
  private baseDelay = 300;
  private maxDelay = 1000;
  private errorRate = 0.05;
  
  private constructor() {}
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * (this.maxDelay - this.baseDelay) + this.baseDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  async request<T>(
    operation: () => T | Promise<T>,
    options?: {
      skipDelay?: boolean;
      errorRate?: number;
    }
  ): Promise<T> {
    if (!options?.skipDelay) {
      await this.simulateDelay();
    }
    
    const errorRate = options?.errorRate ?? this.errorRate;
    if (Math.random() < errorRate) {
      throw new ApiError(
        'Simulated network error',
        Math.random() > 0.5 ? 500 : 503,
        'NETWORK_ERROR'
      );
    }
    
    try {
      const result = await Promise.resolve(operation());
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'INTERNAL_ERROR'
      );
    }
  }
  
  setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }
  
  setDelayRange(min: number, max: number): void {
    this.baseDelay = Math.max(0, min);
    this.maxDelay = Math.max(this.baseDelay, max);
  }
}