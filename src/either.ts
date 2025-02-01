type PromiseEither<L, R> = Promise<Either<L, R>>;

export abstract class Either<L, R> {
	public abstract map<T>(mapper: (value: R) => T): Either<L, T>;
	public abstract mapError<T>(fn: (val: L) => T): Either<T, R>;
	public abstract flatMap<U, T>(
		mapper: (value: R) => Either<U, T>,
	): Either<U | L, T>;

	public abstract filter<E>(
		predicate: (value: R) => boolean,
		errorFactory: (value: R) => E,
	): Either<L | E, R>;

	public abstract getOrElse(defaultValue: R): R;
	public abstract getErrorOrElse(defaultError: L): L;

	public abstract isRight(): this is Right<L, R>;
	public abstract isLeft(): this is Left<L, R>;

	public abstract unwrap(): R;
	public abstract unwrapError(): L;

	public abstract ifRight(callback: (value: R) => void): this;
	public abstract ifLeft(callback: (error: L) => void): this;

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

	public static fromNullable<L, R>(
		value: R | null | undefined,
		error: L,
	): Either<L, R> {
		return value === null || value === undefined
			? new Left(error)
			: new Right(value);
	}

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
}

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
}

export const left = <L, R>(error: L): Left<L, R> => {
	return new Left<L, R>(error);
};

export const right = <L, R>(value: R): Either<L, R> => {
	return new Right<L, R>(value);
};
