import { renderHook, act } from "@testing-library/react";
import { useReactiveRef } from "../useReactiveRef";
import { useReactiveState } from "../useReactiveState";

describe("useReactiveState", () => {
  it("should return initial value from reactive ref", () => {
    const { result: refResult } = renderHook(() => useReactiveRef(0));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current).toBe(0);
  });

  it("should update state when ref current changes", () => {
    const { result: refResult } = renderHook(() => useReactiveRef(0));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    act(() => {
      refResult.current.current = 10;
    });

    expect(stateResult.current).toBe(10);
  });

  it("should work with object values", () => {
    const initialValue = { name: "John", age: 30 };
    const { result: refResult } = renderHook(() =>
      useReactiveRef(initialValue)
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current).toEqual({ name: "John", age: 30 });

    act(() => {
      refResult.current.current.name = "Jane";
    });

    expect(stateResult.current.name).toBe("Jane");
    expect(stateResult.current.age).toBe(30);
  });

  it("should shallow copy object values", () => {
    const initialValue = { name: "John", age: 30 };
    const { result: refResult } = renderHook(() =>
      useReactiveRef(initialValue)
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    const firstState = stateResult.current;

    act(() => {
      refResult.current.current.name = "Jane";
    });

    const secondState = stateResult.current;

    // Should be different objects (shallow copy)
    expect(firstState).not.toBe(secondState);
    expect(secondState.name).toBe("Jane");
  });

  it("should work with array values", () => {
    const { result: refResult } = renderHook(() => useReactiveRef([1, 2, 3]));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current).toEqual([1, 2, 3]);

    act(() => {
      refResult.current.current.push(4);
    });

    expect(stateResult.current).toEqual([1, 2, 3, 4]);
  });

  it("should shallow copy array values", () => {
    const { result: refResult } = renderHook(() => useReactiveRef([1, 2, 3]));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    const firstState = stateResult.current;

    act(() => {
      refResult.current.current.push(4);
    });

    const secondState = stateResult.current;

    // Should be different arrays (shallow copy)
    expect(firstState).not.toBe(secondState);
    expect(secondState.length).toBe(4);
  });

  it("should work with Map values", () => {
    const initialMap = new Map([["key1", "value1"]]);
    const { result: refResult } = renderHook(() => useReactiveRef(initialMap));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current.get("key1")).toBe("value1");

    act(() => {
      refResult.current.current.set("key2", "value2");
    });

    expect(stateResult.current.get("key2")).toBe("value2");
    expect(stateResult.current.size).toBe(2);
  });

  it("should shallow copy Map values", () => {
    const initialMap = new Map([["key1", "value1"]]);
    const { result: refResult } = renderHook(() => useReactiveRef(initialMap));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    const firstState = stateResult.current;

    act(() => {
      refResult.current.current.set("key2", "value2");
    });

    const secondState = stateResult.current;

    // Should be different Map instances (shallow copy)
    expect(firstState).not.toBe(secondState);
    expect(secondState.size).toBe(2);
  });

  it("should work with Set values", () => {
    const initialSet = new Set([1, 2, 3]);
    const { result: refResult } = renderHook(() => useReactiveRef(initialSet));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current.has(1)).toBe(true);
    expect(stateResult.current.size).toBe(3);

    act(() => {
      refResult.current.current.add(4);
    });

    expect(stateResult.current.has(4)).toBe(true);
    expect(stateResult.current.size).toBe(4);
  });

  it("should shallow copy Set values", () => {
    const initialSet = new Set([1, 2, 3]);
    const { result: refResult } = renderHook(() => useReactiveRef(initialSet));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    const firstState = stateResult.current;

    act(() => {
      refResult.current.current.add(4);
    });

    const secondState = stateResult.current;

    // Should be different Set instances (shallow copy)
    expect(firstState).not.toBe(secondState);
    expect(secondState.size).toBe(4);
  });

  it("should work with Date values", () => {
    const initialDate = new Date("2024-01-01");
    const { result: refResult } = renderHook(() => useReactiveRef(initialDate));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current.getTime()).toBe(initialDate.getTime());

    act(() => {
      refResult.current.current = new Date("2024-12-31");
    });

    expect(stateResult.current.getTime()).toBe(
      new Date("2024-12-31").getTime()
    );
  });

  it("should shallow copy Date values", () => {
    const initialDate = new Date("2024-01-01");
    const { result: refResult } = renderHook(() => useReactiveRef(initialDate));
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    const firstState = stateResult.current;

    act(() => {
      refResult.current.current = new Date("2024-12-31");
    });

    const secondState = stateResult.current;

    // Should be different Date instances (shallow copy)
    expect(firstState).not.toBe(secondState);
  });

  it("should handle primitive values", () => {
    const { result: stringRef } = renderHook(() => useReactiveRef("hello"));
    const { result: stringState } = renderHook(() =>
      useReactiveState(stringRef.current)
    );

    const { result: numberRef } = renderHook(() => useReactiveRef(42));
    const { result: numberState } = renderHook(() =>
      useReactiveState(numberRef.current)
    );

    const { result: booleanRef } = renderHook(() => useReactiveRef(true));
    const { result: booleanState } = renderHook(() =>
      useReactiveState(booleanRef.current)
    );

    expect(stringState.current).toBe("hello");
    expect(numberState.current).toBe(42);
    expect(booleanState.current).toBe(true);

    act(() => {
      stringRef.current.current = "world";
      numberRef.current.current = 100;
      booleanRef.current.current = false;
    });

    expect(stringState.current).toBe("world");
    expect(numberState.current).toBe(100);
    expect(booleanState.current).toBe(false);
  });

  it("should handle nested object updates", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef({
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      })
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current.user.profile.name).toBe("John");

    act(() => {
      refResult.current.current.user.profile.name = "Jane";
      refResult.current.current.user.profile.age = 25;
    });

    expect(stateResult.current.user.profile.name).toBe("Jane");
    expect(stateResult.current.user.profile.age).toBe(25);
  });

  it("should handle multiple state updates", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef({ count: 0 })
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    act(() => {
      refResult.current.current.count = 1;
      refResult.current.current.count = 2;
      refResult.current.current.count = 3;
    });

    expect(stateResult.current.count).toBe(3);
  });

  it("should cleanup watch on unmount", () => {
    const { result: refResult } = renderHook(() => useReactiveRef(0));
    const { result: stateResult, unmount } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    unmount();

    // Should not throw after unmount
    act(() => {
      refResult.current.current = 100;
    });

    // State should still have the last value
    expect(stateResult.current).toBeDefined();
  });

  it("should handle null values", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef<{ value: string } | null>(null)
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current).toBeNull();

    act(() => {
      refResult.current.current = { value: "test" };
    });

    expect(stateResult.current).toEqual({ value: "test" });
  });

  it("should handle undefined values", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef<{ value: string } | undefined>(undefined)
    );
    const { result: stateResult } = renderHook(() =>
      useReactiveState(refResult.current)
    );

    expect(stateResult.current).toBeUndefined();

    act(() => {
      refResult.current.current = { value: "test" };
    });

    expect(stateResult.current).toEqual({ value: "test" });
  });
});
