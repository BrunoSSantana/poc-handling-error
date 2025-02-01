# Either Type Documentation

## Overview

The `Either` type is a functional programming construct that represents a value of one of two types: a `Left` representing a failure, or a `Right` representing a success. This implementation provides a robust way to handle errors and computations that might fail, without throwing exceptions.

## Installation

```bash
npm install @your-org/either
```

## Basic Usage

```typescript
import { Either, left, right } from '@your-org/either';

// Success case
const success = right(42);

// Error case
const error = left(new Error('Something went wrong'));

// Handling both cases
success
  .ifRight(value => console.log(`Success: ${value}`))
  .ifLeft(error => console.error(`Error: ${error.message}`));
```

## Core Classes

### Either<L, R>

Abstract base class that defines the interface for both `Left` and `Right` types.

#### Type Parameters

- `L`: The type of the error value (Left)
- `R`: The type of the success value (Right)

### Left<L, R>

Represents a failure case containing an error value of type `L`.

### Right<L, R>

Represents a success case containing a value of type `R`.

## Instance Methods

### map<T>(mapper: (value: R) => T): Either<L, T>

Transforms the success value using the provided mapper function.

```typescript
const result = right(5)
  .map(x => x * 2)  // Right(10)
```

### mapError<T>(fn: (val: L) => T): Either<T, R>

Transforms the error value using the provided function.

```typescript
const result = left('error')
  .mapError(err => new Error(err))  // Left(Error('error'))
```

### flatMap<U, T>(mapper: (value: R) => Either<U, T>): Either<U | L, T>

Chains operations that return Either.

```typescript
const divide = (n: number, d: number): Either<string, number> =>
  d === 0 ? left('Division by zero') : right(n / d);

const result = right(10)
  .flatMap(n => divide(n, 2))  // Right(5)
```

### filter<E>(predicate: (value: R) => boolean, errorFactory: (value: R) => E): Either<L | E, R>

Filters success values based on a predicate.

```typescript
const result = right(5)
  .filter(
    n => n > 0,
    n => `${n} is not positive`
  )  // Right(5)
```

### getOrElse(defaultValue: R): R

Returns the success value or a default value if it's an error.

```typescript
const value = left('error')
  .getOrElse(42)  // 42
```

### getErrorOrElse(defaultError: L): L

Returns the error value or a default error if it's a success.

```typescript
const error = right(42)
  .getErrorOrElse('default error')  // 'default error'
```

### unwrap(): R

Extracts the success value or throws if it's an error.

```typescript
const value = right(42).unwrap()  // 42
```

### unwrapError(): L

Extracts the error value or throws if it's a success.

```typescript
const error = left('error').unwrapError()  // 'error'
```

### ifRight(callback: (value: R) => void): this

Executes a callback if the value is a success.

### ifLeft(callback: (error: L) => void): this

Executes a callback if the value is an error.

## Static Methods

### fromPromise<L, R>(promise: Promise<R>): Promise<Either<L, R>>

Converts a Promise into an Either.

```typescript
const result = await Either.fromPromise(fetch('api/data'));
```

### fromNullable<L, R>(value: R | null | undefined, error: L): Either<L, R>

Creates an Either from a nullable value.

```typescript
const result = Either.fromNullable(maybeNull, 'Value was null');
```

### combine<L, R>(eithers: Either<L, R>[]): Either<L, R[]>

Combines multiple Eithers into one, failing if any fail.

```typescript
const results = Either.combine([
  right(1),
  right(2),
  right(3)
]);  // Right([1, 2, 3])
```

### sequence<L, R>(eithers: Either<L, R>[]): Either<L[], R[]>

Processes all Eithers and collects successes and failures.

```typescript
const results = Either.sequence([
  right(1),
  left('error'),
  right(3)
]);  // Left(['error'])
```

## Factory Functions

### left<L, R>(error: L): Left<L, R>

Creates a new Left (error) value.

### right<L, R>(value: R): Right<L, R>

Creates a new Right (success) value.

## Common Use Cases

### Error Handling

```typescript
const divideBy = (n: number, d: number): Either<string, number> => {
  if (d === 0) return left('Division by zero');
  return right(n / d);
};

const result = divideBy(10, 2)
  .map(result => result * 2)
  .filter(
    n => n < 20,
    n => `${n} is too large`
  );
```

### Validation

```typescript
interface User {
  name: string;
  age: number;
}

const validateUser = (user: User): Either<string[], User> => {
  const errors: string[] = [];

  if (user.name.length < 2) errors.push('Name too short');
  if (user.age < 18) errors.push('Must be 18 or older');

  return errors.length ? left(errors) : right(user);
};
```

### API Calls

```typescript
const fetchUser = async (id: string): Promise<Either<Error, User>> => {
  return Either.fromPromise(
    fetch(`/api/users/${id}`).then(r => r.json())
  );
};

// Usage
const user = await fetchUser('123')
  .map(user => ({ ...user, lastAccess: new Date() }))
  .ifLeft(error => logError(error));
```

## Best Practices

1. Use `Left` for expected errors and validation failures
2. Avoid throwing exceptions in Either operations
3. Keep transformations pure in `map` and `flatMap`
4. Use `ifLeft` and `ifRight` for side effects
5. Prefer `getOrElse` over `unwrap` when possible

## TypeScript Integration

The implementation is fully typed and provides type inference:

```typescript
// Error type is inferred
const result = right(42)
  .map(n => n.toString())  // Either<never, string>
  .filter(
    s => s.length > 1,
    s => new Error(`Invalid length: ${s}`)  // Either<Error, string>
  );
```