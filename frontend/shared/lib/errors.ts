/**
 * A base error class for all custom application errors.
 * This allows us to catch all custom errors with a single `instanceof AppError`.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Thrown when a user is not authenticated.
 */
export class AuthenticationError extends AppError {
  constructor(message = "You must be logged in to perform this action.") {
    super(message);
  }
}

/**
 * Thrown when a user is not authorized to perform an action.
 */
export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
  }
}

/**
 * Thrown when a requested resource (e.g., a page or user) is not found.
 */
export class NotFoundError extends AppError {
  constructor(message = "The requested resource could not be found.") {
    super(message);
  }
}

/**
 * Thrown for validation or business logic failures (e.g., invalid input).
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
