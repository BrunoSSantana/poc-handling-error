/**
 * A type representing a Promise that resolves to an Either value
 */
type PromiseEither<L, R> = Promise<Either<L, R>>;

/**
 * The Either monad represents values that can be one of two types: Left (typically for errors)
 * or Right (typically for successful values). It provides a way to handle computations that
 * might fail without using exceptions.
 *
 * @template L The type of the Left (error) value
 * @template R The type of the Right (success) value
 */
export abstract class Either<L, R> {
	/**
	 * Transforms the Right value using the provided mapper function.
	 * If this is a Left, returns a new Left with the same error.
	 *
	 * @param mapper Function to transform the Right value
	 * @returns A new Either with the transformed value
	 */
	public abstract map<T>(mapper: (value: R) => T): Either<L, T>;

	/**
	 * Transforms the Left (error) value using the provided function.
	 * If this is a Right, returns a new Right with the same value.
	 *
	 * @param fn Function to transform the Left value
	 * @returns A new Either with the transformed error
	 */
	public abstract mapError<T>(fn: (val: L) => T): Either<T, R>;

	/**
	 * Chains another Either-returning operation after this one.
	 * Similar to map, but the mapper returns an Either instead of a plain value.
	 *
	 * @param mapper Function that returns a new Either
	 * @returns A new Either combining both operations
	 */
	public abstract flatMap<U, T>(
		mapper: (value: R) => Either<U, T>,
	): Either<U | L, T>;

	/**
	 * Filters a Right value using a predicate. If the predicate returns false,
	 * converts the Right to a Left using the provided error factory.
	 *
	 * @param predicate Function that tests the Right value
	 * @param errorFactory Function that creates an error value if predicate fails
	 * @returns Either the original Right or a new Left
	 */
	public abstract filter<E>(
		predicate: (value: R) => boolean,
		errorFactory: (value: R) => E,
	): Either<L | E, R>;

	/**
	 * Returns the Right value if present, otherwise returns the provided default value.
	 *
	 * @param defaultValue Default value to return if Right is empty
	 * @returns The Right value or the default value
	 */
	public abstract getOrElse(defaultValue: R): R;
	/**
	 * Returns the Left value if present, otherwise returns the provided default error.
	 *
	 * @param defaultError Default error to return if Left is empty
	 * @returns The Left error or the default error
	 */
	public abstract getErrorOrElse(defaultError: L): L;

	/**
	 * Type guard that checks if this Either is a Right.
	 * @returns True if this is a Right, false otherwise
	 */
	public abstract isRight(): this is Right<L, R>;

	/**
	 * Type guard that checks if this Either is a Left.
	 * @returns True if this is a Left, false otherwise
	 */
	public abstract isLeft(): this is Left<L, R>;

	/**
	 * Extracts the Right value. Throws an error if this is a Left.
	 * @returns The Right value
	 * @throws Error if this is a Left
	 */
	public abstract unwrap(): R;
	/**
	 * Extracts the Left value. Throws an error if this is a Right.
	 * @returns The Left value
	 * @throws Error if this is a Right
	 */
	public abstract unwrapError(): L;

	/**
	 * Executes a callback if this is a Right. Returns this for chaining.
	 * @param callback Callback to execute
	 * @returns This Either
	 */
	public abstract ifRight(callback: (value: R) => void): this;
	/**
	 * Executes a callback if this is a Left. Returns this for chaining.
	 * @param callback Callback to execute
	 * @returns This Either
	 */
	public abstract ifLeft(callback: (error: L) => void): this;

	/**
	 * Pattern matches on the Either, executing different functions based on whether
	 * it's a Left or Right.
	 *
	 * @param cases Object containing functions for both Left and Right cases
	 * @returns The result of executing the appropriate function
	 */
	public abstract match<T>(cases: {
		left: (error: L) => T;
		right: (value: R) => T;
	}): T;

	/**
	 * Creates an Either from a Promise. The Promise's resolved value becomes
	 * a Right, and any rejected value becomes a Left.
	 *
	 * @param promise The input Promise
	 * @returns A Promise that resolves to an Either
	 */
	public static async fromPromise<L, R>(
		promise: Promise<R>,
	): PromiseEither<L, R> {
		try {
			const value = await promise;
			return new Right<L, R>(value);
		} catch (error) {
			return new Left<L, R>(error as L);
		}
	}

	/**
	 * Creates an Either from a nullable value. Null or undefined become
	 * a Left with the provided error, any other value becomes a Right.
	 *
	 * @param value The possibly null/undefined value
	 * @param error The error to use if value is null/undefined
	 * @returns An Either representing the nullable value
	 */
	public static fromNullable<L, R>(
		value: R | null | undefined,
		error: L,
	): Either<L, R> {
		return value === null || value === undefined
			? new Left(error)
			: new Right(value);
	}

	/**
	 * Combines an array of Eithers into a single Either. If any input is a Left,
	 * returns the first Left encountered. Otherwise, returns a Right containing
	 * an array of all Right values.
	 *
	 * @param eithers Array of Eithers to combine
	 * @returns An Either containing either the first error or all success values
	 */
	public static combine<L, R>(eithers: Either<L, R>[]): Either<L, R[]> {
		const rights: R[] = [];
		for (const either of eithers) {
			if (either.isLeft()) {
				return new Left(either.unwrapError());
			}
			rights.push(either.unwrap());
		}
		return new Right(rights);
	}

	/**
	 * Sequences an array of Eithers into a single Either. Collects all Left and Right
	 * values separately. If there are any Lefts, returns a Left containing all errors,
	 * otherwise returns a Right containing all success values.
	 *
	 * @param eithers Array of Eithers to sequence
	 * @returns An Either containing either all errors or all success values
	 */
	public static sequence<L, R>(eithers: Either<L, R>[]): Either<L[], R[]> {
		const rights: R[] = [];
		const lefts: L[] = [];

		for (const either of eithers) {
			if (either.isRight()) {
				rights.push(either.unwrap());
			} else {
				lefts.push(either.unwrapError());
			}
		}

		return lefts.length ? new Left(lefts) : new Right(rights);
	}
}

/**
 * Represents the Left (error) case of an Either.
 * @template L The type of the Left (error) value
 * @template R The type of the Right (success) value
 * @see {@link Either}
 */
export class Left<L, R> extends Either<L, R> {
	constructor(private readonly error: L) {
		super();
	}

	map<T>(_mapper: (value: R) => T): Either<L, T> {
		return new Left<L, T>(this.error);
	}

	mapError<T>(fn: (val: L) => T): Either<T, R> {
		return new Left<T, R>(fn(this.error));
	}

	flatMap<U, T>(_mapper: (value: R) => Either<U, T>): Either<L | U, T> {
		return new Left<L | U, T>(this.error);
	}

	filter<E>(
		_predicate: (value: R) => boolean,
		_errorFactory: (value: R) => E,
	): Either<L | E, R> {
		return new Left<L | E, R>(this.error);
	}

	getOrElse(defaultValue: R): R {
		return defaultValue;
	}

	getErrorOrElse(_defaultError: L): L {
		return this.error;
	}

	isRight(): this is Right<L, R> {
		return false;
	}

	isLeft(): this is Left<L, R> {
		return true;
	}

	unwrap(): R {
		throw new Error(`Cannot unwrap Left value: ${JSON.stringify(this.error)}`);
	}

	unwrapError(): L {
		return this.error;
	}

	ifRight(_callback: (value: R) => void): this {
		return this;
	}

	ifLeft(callback: (error: L) => void): this {
		callback(this.error);
		return this;
	}

	/** Implementação do match() */
	match<T>(cases: { left: (error: L) => T; right: (value: R) => T }): T {
		return cases.left(this.error);
	}
}

/**
 * Represents the Right (success) case of an Either.
 * @template L The type of the Left (error) value
 * @template R The type of the Right (success) value
 * @see {@link Either}
 */
export class Right<L, R> extends Either<L, R> {
	constructor(private readonly value: R) {
		super();
	}

	map<T>(mapper: (value: R) => T): Either<L, T> {
		return new Right<L, T>(mapper(this.value));
	}

	mapError<T>(_fn: (val: L) => T): Either<T, R> {
		return new Right<T, R>(this.value);
	}

	flatMap<U, T>(mapper: (value: R) => Either<U, T>): Either<L | U, T> {
		return mapper(this.value);
	}

	filter<E>(
		predicate: (value: R) => boolean,
		errorFactory: (value: R) => E,
	): Either<L | E, R> {
		return predicate(this.value)
			? new Right<L | E, R>(this.value)
			: new Left<L | E, R>(errorFactory(this.value));
	}

	getOrElse(_defaultValue: R): R {
		return this.value;
	}

	getErrorOrElse(defaultError: L): L {
		return defaultError;
	}

	isRight(): this is Right<L, R> {
		return true;
	}

	isLeft(): this is Left<L, R> {
		return false;
	}

	unwrap(): R {
		return this.value;
	}

	unwrapError(): L {
		throw new Error("Cannot unwrap error from Right value");
	}

	ifRight(callback: (value: R) => void): this {
		callback(this.value);
		return this;
	}

	ifLeft(_callback: (error: L) => void): this {
		return this;
	}

	/** Implementação do match() */
	match<T>(cases: { left: (error: L) => T; right: (value: R) => T }): T {
		return cases.right(this.value);
	}
}

/**
 * Helper function to create a Left value
 * @param error The error value
 * @returns A new Left instance
 */
export const left = <L, R>(error: L): Left<L, R> => {
	return new Left<L, R>(error);
};

/**
 * Helper function to create a Right value
 * @param value The success value
 * @returns A new Right instance
 */
export const right = <L, R>(value: R): Either<L, R> => {
	return new Right<L, R>(value);
};
