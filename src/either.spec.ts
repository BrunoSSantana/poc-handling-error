import { describe, expect, it, vi } from "vitest";
import { Either, left, right } from "./either";

describe("Either", () => {
	describe("Right", () => {
		it("should create Right value", () => {
			const r = right(5);
			expect(r.isRight()).toBe(true);
			expect(r.isLeft()).toBe(false);
			expect(r.unwrap()).toBe(5);
		});

		it("should map Right value", () => {
			const r = right(5).map((x) => x * 2);
			expect(r.unwrap()).toBe(10);
		});

		it("should not mapError Right value", () => {
			const r = right(5).mapError((e) => `Error: ${e}`);
			expect(r.unwrap()).toBe(5);
		});

		it("should flatMap Right value", () => {
			const r = right(5).flatMap((x) => right(x * 2));
			expect(r.unwrap()).toBe(10);
		});

		it("should filter Right value", () => {
			const successCase = right(5).filter(
				(x) => x > 0,
				(x) => `${x} is not positive`,
			);
			expect(successCase.isRight()).toBe(true);
			expect(successCase.unwrap()).toBe(5);

			const failureCase = right(5).filter(
				(x) => x > 10,
				(x) => `${x} is too small`,
			);
			expect(failureCase.isLeft()).toBe(true);
			expect(failureCase.unwrapError()).toBe("5 is too small");
		});

		it("should handle getOrElse", () => {
			const r = right(5).getOrElse(10);
			expect(r).toBe(5);
		});

		it("should handle getErrorOrElse", () => {
			const r = right(5).getErrorOrElse("error");
			expect(r).toBe("error");
		});

		it("should throw on unwrapError", () => {
			expect(() => right(5).unwrapError()).toThrow();
		});

		it("should handle callbacks", () => {
			const rightCallback = vi.fn();
			const leftCallback = vi.fn();

			right(5).ifRight(rightCallback).ifLeft(leftCallback);

			expect(rightCallback).toHaveBeenCalledWith(5);
			expect(leftCallback).not.toHaveBeenCalled();
		});
	});

	describe("Left", () => {
		it("should create Left value", () => {
			const l = left("error");
			expect(l.isLeft()).toBe(true);
			expect(l.isRight()).toBe(false);
			expect(l.unwrapError()).toBe("error");
		});

		it("should not map Left value", () => {
			// @ts-ignore
			const l = left("error").map((x) => x * 2);
			expect(l.unwrapError()).toBe("error");
		});

		it("should mapError Left value", () => {
			const l = left("error").mapError((e) => `New ${e}`);
			expect(l.unwrapError()).toBe("New error");
		});

		it("should not flatMap Left value", () => {
			// @ts-ignore
			const l = left("error").flatMap((x) => right(x * 2));
			expect(l.unwrapError()).toBe("error");
		});

		it("should not filter Left value", () => {
			const l = left("error").filter(
				// @ts-ignore
				(x) => x > 0,
				(x) => `${x} is not positive`,
			);
			expect(l.unwrapError()).toBe("error");
		});

		it("should handle getOrElse", () => {
			const l = left("error").getOrElse(10);
			expect(l).toBe(10);
		});

		it("should handle getErrorOrElse", () => {
			const l = left("error").getErrorOrElse("default error");
			expect(l).toBe("error");
		});

		it("should throw on unwrap", () => {
			expect(() => left("error").unwrap()).toThrow();
		});

		it("should handle callbacks", () => {
			const rightCallback = vi.fn();
			const leftCallback = vi.fn();

			left("error").ifRight(rightCallback).ifLeft(leftCallback);

			expect(rightCallback).not.toHaveBeenCalled();
			expect(leftCallback).toHaveBeenCalledWith("error");
		});
	});

	describe("Static Methods", () => {
		describe("fromPromise", () => {
			it("should handle resolved promise", async () => {
				const promise = Promise.resolve(5);
				const result = await Either.fromPromise(promise);
				expect(result.isRight()).toBe(true);
				expect(result.unwrap()).toBe(5);
			});

			it("should handle rejected promise", async () => {
				const promise = Promise.reject("error");
				const result = await Either.fromPromise(promise);
				expect(result.isLeft()).toBe(true);
				expect(result.unwrapError()).toBe("error");
			});
		});

		describe("fromNullable", () => {
			it("should handle non-null value", () => {
				const result = Either.fromNullable(5, "error");
				expect(result.isRight()).toBe(true);
				expect(result.unwrap()).toBe(5);
			});

			it("should handle null value", () => {
				const result = Either.fromNullable(null, "error");
				expect(result.isLeft()).toBe(true);
				expect(result.unwrapError()).toBe("error");
			});

			it("should handle undefined value", () => {
				const result = Either.fromNullable(undefined, "error");
				expect(result.isLeft()).toBe(true);
				expect(result.unwrapError()).toBe("error");
			});
		});

		describe("combine", () => {
			it("should combine all rights", () => {
				const eithers = [right(1), right(2), right(3)];
				const result = Either.combine(eithers);
				expect(result.isRight()).toBe(true);
				expect(result.unwrap()).toEqual([1, 2, 3]);
			});

			it("should fail on first left", () => {
				const eithers = [right(1), left("error"), right(3)];
				const result = Either.combine(eithers);
				expect(result.isLeft()).toBe(true);
				expect(result.unwrapError()).toBe("error");
			});
		});

		describe("sequence", () => {
			it("should collect all rights when no lefts", () => {
				const eithers = [right(1), right(2), right(3)];
				const result = Either.sequence(eithers);
				expect(result.isRight()).toBe(true);
				expect(result.unwrap()).toEqual([1, 2, 3]);
			});

			it("should collect all lefts when present", () => {
				const eithers = [right(1), left("error1"), right(3), left("error2")];
				const result = Either.sequence(eithers);
				expect(result.isLeft()).toBe(true);
				expect(result.unwrapError()).toEqual(["error1", "error2"]);
			});
		});
	});

	describe("Complex Scenarios", () => {
		it("should handle chained operations", () => {
			const result = right(5)
				.map((x) => x * 2)
				.filter(
					(x) => x > 5,
					(x) => `${x} is too small`,
				)
				.flatMap((x) => right(x.toString()));

			expect(result.isRight()).toBe(true);
			expect(result.unwrap()).toBe("10");
		});

		it("should short-circuit on left", () => {
			const mapSpy = vi.fn();
			const filterSpy = vi.fn();
			const flatMapSpy = vi.fn();

			const result = left("initial error")
				.map(mapSpy)
				.filter(filterSpy, (x) => `${x} is invalid`)
				.flatMap(flatMapSpy);

			expect(result.isLeft()).toBe(true);
			expect(result.unwrapError()).toBe("initial error");
			expect(mapSpy).not.toHaveBeenCalled();
			expect(filterSpy).not.toHaveBeenCalled();
			expect(flatMapSpy).not.toHaveBeenCalled();
		});
	});
});
