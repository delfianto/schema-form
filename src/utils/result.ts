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

export class ResultHelpers {
	static ok<T>(data: T, message?: string): Ok<T> {
		return {
			success: true,
			data,
			...(message && { message }),
		};
	}

	static err<E = string>(error: E, message: string, details?: Error): Err<E> {
		return {
			success: false,
			error,
			message,
			...(details && { details }),
		};
	}

	// Type guards
	static isOk<T, E>(result: Result<T, E>): result is Ok<T> {
		return result.success === true;
	}

	static isErr<T, E>(result: Result<T, E>): result is Err<E> {
		return result.success === false;
	}

	// Utility methods
	static map<T, U, E>(
		result: Result<T, E>,
		fn: (data: T) => U,
	): Result<U, E> {
		if (ResultHelpers.isOk(result)) {
			return ResultHelpers.ok(fn(result.data));
		}
		return result;
	}

	static flatMap<T, U, E>(
		result: Result<T, E>,
		fn: (data: T) => Result<U, E>,
	): Result<U, E> {
		if (ResultHelpers.isOk(result)) {
			return fn(result.data);
		}
		return result;
	}

	static unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
		return ResultHelpers.isOk(result) ? result.data : defaultValue;
	}

	static unwrapOrThrow<T, E>(result: Result<T, E>): T {
		if (ResultHelpers.isOk(result)) {
			return result.data;
		}
		throw new Error(result.message);
	}
}
