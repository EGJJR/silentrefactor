export interface AnalysisRequest {
    code: string;
    language: string;
  }
  
  export interface AnalysisResponse {
    success: boolean;
    issues?: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestion: string;
      lineNumber?: number;
    }>;
    error?: string;
  }
  
  export interface APIResponse<T> {
    data?: T;
    error?: string;
    status: 'success' | 'error';
  }
  
  export function isAPIResponse<T>(response: unknown): response is APIResponse<T> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'status' in response &&
      ('data' in response || 'error' in response)
    );
  }