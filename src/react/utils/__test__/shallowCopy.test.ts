import { shallowCopy } from "../shallowCopy";

describe("shallowCopy", () => {
  it("should shallow copy Map", () => {
    const original = new Map([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    const copied = shallowCopy(original);

    expect(copied).toBeInstanceOf(Map);
    expect(copied).not.toBe(original);
    expect(copied.get("key1")).toBe("value1");
    expect(copied.get("key2")).toBe("value2");

    // Modify copied should not affect original
    copied.set("key3", "value3");
    expect(original.has("key3")).toBe(false);
  });

  it("should shallow copy Set", () => {
    const original = new Set([1, 2, 3]);
    const copied = shallowCopy(original);

    expect(copied).toBeInstanceOf(Set);
    expect(copied).not.toBe(original);
    expect(copied.has(1)).toBe(true);
    expect(copied.has(2)).toBe(true);
    expect(copied.has(3)).toBe(true);

    // Modify copied should not affect original
    copied.add(4);
    expect(original.has(4)).toBe(false);
  });

  it("should shallow copy Date", () => {
    const original = new Date("2024-01-01");
    const copied = shallowCopy(original);

    expect(copied).toBeInstanceOf(Date);
    expect(copied).not.toBe(original);
    expect(copied.getTime()).toBe(original.getTime());

    // Modify copied should not affect original
    copied.setFullYear(2025);
    expect(original.getFullYear()).toBe(2024);
  });

  it("should shallow copy Array", () => {
    const original = [1, 2, 3];
    const copied = shallowCopy(original);

    expect(Array.isArray(copied)).toBe(true);
    expect(copied).not.toBe(original);
    expect(copied).toEqual([1, 2, 3]);

    // Modify copied should not affect original
    copied.push(4);
    expect(original.length).toBe(3);
  });

  it("should shallow copy nested arrays (reference is preserved)", () => {
    const nested = [1, 2];
    const original = [nested, 3];
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied[0]).toBe(nested); // Shallow copy preserves reference

    // Modifying nested array affects both
    (copied[0] as number[]).push(99);
    expect(nested).toEqual([1, 2, 99]);
  });

  it("should shallow copy Object", () => {
    const original = { name: "John", age: 30 };
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied).toEqual({ name: "John", age: 30 });

    // Modify copied should not affect original
    copied.age = 31;
    expect(original.age).toBe(30);
  });

  it("should shallow copy nested objects (reference is preserved)", () => {
    const nested = { value: 42 };
    const original = { data: nested };
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied.data).toBe(nested); // Shallow copy preserves reference

    // Modifying nested object affects both
    copied.data.value = 100;
    expect(nested.value).toBe(100);
  });

  it("should return primitive values as-is", () => {
    expect(shallowCopy(42)).toBe(42);
    expect(shallowCopy("hello")).toBe("hello");
    expect(shallowCopy(true)).toBe(true);
    expect(shallowCopy(false)).toBe(false);
    expect(shallowCopy(undefined)).toBe(undefined);
    expect(shallowCopy(null)).toBe(null);
  });

  it("should handle empty collections", () => {
    expect(shallowCopy(new Map())).toEqual(new Map());
    expect(shallowCopy(new Set())).toEqual(new Set());
    expect(shallowCopy([])).toEqual([]);
    expect(shallowCopy({})).toEqual({});
  });

  it("should handle Map with object values", () => {
    const obj = { value: 1 };
    const original = new Map([["key", obj]]);
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied.get("key")).toBe(obj); // Shallow copy preserves reference

    // Modifying value affects both
    (copied.get("key") as { value: number }).value = 2;
    expect(obj.value).toBe(2);
  });

  it("should handle Set with object values", () => {
    const obj = { value: 1 };
    const original = new Set([obj]);
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied.has(obj)).toBe(true); // Shallow copy preserves reference

    // Both sets contain the same object
    obj.value = 2;
    expect(Array.from(copied)[0]).toBe(obj);
  });

  it("should handle complex nested structures", () => {
    const original = {
      users: [{ name: "Alice" }, { name: "Bob" }],
      metadata: new Map([["version", "1.0.0"]]),
    };
    const copied = shallowCopy(original);

    expect(copied).not.toBe(original);
    expect(copied.users).toBe(original.users); // Shallow copy
    expect(copied.metadata).toBe(original.metadata); // Shallow copy

    // Modifying nested structure affects both
    copied.users[0].name = "Charlie";
    expect(original.users[0].name).toBe("Charlie");
  });
});
