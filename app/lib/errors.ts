/**
 * Centralized Error Handling
 * ══════════════════════════
 * Custom errors and response types for consistent error handling
 */

// ═══════════════════════════════════════════════════════════
// Custom Error Classes
// ═══════════════════════════════════════════════════════════

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    public message: string,
    public errors: Record<string, string> = {}
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "يرجى تسجيل الدخول") {
    super(message, "UNAUTHENTICATED", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "غير مصرح بالوصول") {
    super(message, "UNAUTHORIZED", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "المورد") {
    super(`${resource} غير موجود`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "البيانات موجودة مسبقاً") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

// ═══════════════════════════════════════════════════════════
// Action Response Types
// ═══════════════════════════════════════════════════════════

export type ActionSuccess<T = unknown> = {
  success: true;
  data?: T;
  message?: string;
};

export type ActionError = {
  success: false;
  error: string;
  errors?: Record<string, string>;
  code?: string;
};

export type ActionResponse<T = unknown> = ActionSuccess<T> | ActionError;

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message?: string
): ActionSuccess<T> {
  return { success: true, data, message };
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  errors?: Record<string, string>,
  code?: string
): ActionError {
  return { success: false, error, errors, code };
}

/**
 * Handle errors and convert to ActionError
 */
export function handleError(error: unknown): ActionError {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, error.errors, error.code);
  }

  if (error instanceof AppError) {
    return errorResponse(error.message, undefined, error.code);
  }

  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    return errorResponse("حدث خطأ غير متوقع");
  }

  console.error("Unknown error:", error);
  return errorResponse("حدث خطأ غير متوقع");
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(
  response: ActionResponse<T>
): response is ActionSuccess<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is error
 */
export function isError(response: ActionResponse): response is ActionError {
  return response.success === false;
}
