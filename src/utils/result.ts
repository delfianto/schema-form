// Rust-like result object for action response
export type Result<T, E = string> = Ok<T> | Err<E>;

export interface Ok<T> {
  success: true;
  data: T;
  message?: string;
}

export interface Err<E = string> {
  success: false;
  error: E;
  message: string;
  details?: Error;
}

export const ResultHelpers = {
  ok<T>(data: T, message?: string): Ok<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  },

  err<E = string>(error: E, message: string, details?: Error): Err<E> {
    return {
      success: false,
      error,
      message,
      ...(details && { details }),
    };
  },

  // Type guards
  isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.success === true;
  },

  isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return result.success === false;
  },

  // Utility methods
  map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
    if (ResultHelpers.isOk(result)) {
      return ResultHelpers.ok(fn(result.data));
    }
    return result;
  },

  flatMap<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
    if (ResultHelpers.isOk(result)) {
      return fn(result.data);
    }
    return result;
  },

  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    return ResultHelpers.isOk(result) ? result.data : defaultValue;
  },

  unwrapOrThrow<T, E>(result: Result<T, E>): T {
    if (ResultHelpers.isOk(result)) {
      return result.data;
    }

    if (result.details) {
      throw result.details;
    }

    throw new Error(result.message);
  },
} as const;
