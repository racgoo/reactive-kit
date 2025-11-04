import { isPrimitive } from "../isPrimitive";

describe("isPrimitive", () => {
  it("should return true for primitive values", () => {
    expect(isPrimitive(42)).toBe(true);
    expect(isPrimitive("hello")).toBe(true);
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
    expect(isPrimitive(undefined)).toBe(true);
    expect(isPrimitive(null)).toBe(false); // typeof null === "object"
    expect(isPrimitive(Symbol("test"))).toBe(true);
  });

  it("should return false for objects", () => {
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive({ name: "test" })).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive([1, 2, 3])).toBe(false);
    expect(isPrimitive(new Map())).toBe(false);
    expect(isPrimitive(new Set())).toBe(false);
    expect(isPrimitive(new Date())).toBe(false);
  });

  it("should return true for functions (typeof function is 'function', not 'object')", () => {
    expect(isPrimitive(() => {})).toBe(true);
    expect(isPrimitive(function test() {})).toBe(true);
    expect(isPrimitive(class Test {})).toBe(true);
  });

  it("should handle edge cases", () => {
    expect(isPrimitive(null)).toBe(false); // typeof null is "object"
    expect(isPrimitive(NaN)).toBe(true);
    expect(isPrimitive(Infinity)).toBe(true);
    expect(isPrimitive(-Infinity)).toBe(true);
  });
});
