export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (error: string, errors?: any[]): ApiResponse => ({
  success: false,
  error,
  errors,
});
