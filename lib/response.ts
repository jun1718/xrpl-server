import { ApiResponse } from "../types/api";

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

export function createErrorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message
  };
}

export function handleApiError(error: any): ApiResponse {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  if (typeof error === "string") {
    return createErrorResponse(error);
  }
  
  return createErrorResponse("Internal server error");
}
