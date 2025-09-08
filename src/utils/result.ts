// Rust-like result object for action response
// Not sure whether to keep using this, for now we keep the code
export type Result<T, E = string> = Ok<T> | Err<E>;

export interface Ok<T> {
  success: true;
  data: T;
}

export interface Err<E = Error> {
  success: false;
  error: E;
}

export const ResultHelper = {
  ok<T>(data: T): Ok<T> {
    return {
      success: true,
      data,
    };
  },

  err<E>(error: E): Err<E> {
    return {
      success: false,
      error,
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
    if (ResultHelper.isOk(result)) {
      return ResultHelper.ok(fn(result.data));
    }
    return result;
  },

  flatMap<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E> {
    if (ResultHelper.isOk(result)) {
      return fn(result.data);
    }
    return result;
  },

  unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    return ResultHelper.isOk(result) ? result.data : defaultValue;
  },

  unwrapOrThrow<T, E>(result: Result<T, E>): T {
    if (ResultHelper.isOk(result)) {
      return result.data;
    }

    throw result.error;
  },
} as const;
