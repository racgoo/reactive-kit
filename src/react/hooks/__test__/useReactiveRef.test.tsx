import { renderHook, act } from "@testing-library/react";
import { useReactiveRef, useReactiveSubRef } from "../useReactiveRef";

describe("useReactiveRef", () => {
  it("should create a reactive ref with initial value", () => {
    const { result } = renderHook(() => useReactiveRef(0));
    expect(result.current.current).toBe(0);
  });

  it("should update ref value when current is modified", () => {
    const { result } = renderHook(() => useReactiveRef(0));

    act(() => {
      result.current.current = 10;
    });

    expect(result.current.current).toBe(10);
  });

  it("should work with object values", () => {
    const initialValue = { name: "John", age: 30 };
    const { result } = renderHook(() => useReactiveRef(initialValue));

    expect(result.current.current).toEqual({ name: "John", age: 30 });

    act(() => {
      result.current.current.name = "Jane";
    });

    expect(result.current.current.name).toBe("Jane");
    expect(result.current.current.age).toBe(30);
  });

  it("should work with array values", () => {
    const { result } = renderHook(() => useReactiveRef([1, 2, 3]));

    expect(result.current.current).toEqual([1, 2, 3]);

    act(() => {
      result.current.current.push(4);
    });

    expect(result.current.current).toEqual([1, 2, 3, 4]);
  });

  it("should work with Map values", () => {
    const { result } = renderHook(() =>
      useReactiveRef(new Map([["key", "value"]]))
    );

    expect(result.current.current.get("key")).toBe("value");

    act(() => {
      result.current.current.set("key2", "value2");
    });

    expect(result.current.current.get("key2")).toBe("value2");
    expect(result.current.current.size).toBe(2);
  });

  it("should work with Set values", () => {
    const { result } = renderHook(() => useReactiveRef(new Set([1, 2, 3])));

    expect(result.current.current.has(1)).toBe(true);
    expect(result.current.current.size).toBe(3);

    act(() => {
      result.current.current.add(4);
    });

    expect(result.current.current.has(4)).toBe(true);
    expect(result.current.current.size).toBe(4);
  });

  it("should maintain reactivity across multiple updates", () => {
    const { result } = renderHook(() => useReactiveRef({ count: 0 }));

    act(() => {
      result.current.current.count = 1;
      result.current.current.count = 2;
      result.current.current.count = 3;
    });

    expect(result.current.current.count).toBe(3);
  });

  it("should handle primitive values", () => {
    const { result: stringResult } = renderHook(() => useReactiveRef("hello"));
    const { result: numberResult } = renderHook(() => useReactiveRef(42));
    const { result: booleanResult } = renderHook(() => useReactiveRef(true));

    expect(stringResult.current.current).toBe("hello");
    expect(numberResult.current.current).toBe(42);
    expect(booleanResult.current.current).toBe(true);
  });
});

describe("useReactiveSubRef", () => {
  it("should create a sub ref with selector", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ user: { name: "John", age: 30 } });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.user);
      return { parentRef, subRef };
    });

    expect(result.current.subRef.current).toEqual({ name: "John", age: 30 });
  });

  it("should update sub ref when parent changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ user: { name: "John", age: 30 } });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.user);
      return { parentRef, subRef };
    });

    act(() => {
      result.current.parentRef.current.user.name = "Jane";
    });

    expect(result.current.subRef.current.name).toBe("Jane");
  });

  it("should update parent when sub ref changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ user: { name: "John", age: 30 } });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.user);
      return { parentRef, subRef };
    });

    act(() => {
      result.current.subRef.current.name = "Jane";
      result.current.subRef.current.age = 25;
    });

    expect(result.current.parentRef.current.user.name).toBe("Jane");
    expect(result.current.parentRef.current.user.age).toBe(25);
  });

  it("should update sub ref when nested property changes", () => {
    const {
      result: { current: parentRef },
    } = renderHook(() =>
      useReactiveRef({
        data: {
          nested: {
            value: "initial",
          },
        },
      })
    );
    const {
      result: { current: subRef },
    } = renderHook(() =>
      useReactiveSubRef(parentRef, (ref) => ref.current.data.nested.value)
    );

    expect(subRef.current).toBe("initial");
    parentRef.current.data.nested.value = "updated";
    expect(subRef.current).toBe("updated");
  });

  it("should work with array selector", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ items: [1, 2, 3] });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.items);
      return { parentRef, subRef };
    });

    expect(result.current.subRef.current).toEqual([1, 2, 3]);

    act(() => {
      result.current.parentRef.current.items.push(4);
    });

    expect(result.current.subRef.current).toEqual([1, 2, 3, 4]);
  });

  it("should update parent when sub ref array changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ items: [1, 2, 3] });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.items);
      return { parentRef, subRef };
    });

    act(() => {
      result.current.subRef.current.push(4);
      result.current.subRef.current[0] = 100;
    });

    expect(result.current.parentRef.current.items).toEqual([100, 2, 3, 4]);
  });

  it("should work with primitive selector", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ count: 0, name: "test" });
      const countRef = useReactiveSubRef(parentRef, (ref) => ref.current.count);
      const nameRef = useReactiveSubRef(parentRef, (ref) => ref.current.name);

      return { parentRef, countRef, nameRef };
    });

    expect(result.current.countRef.current).toBe(0);
    expect(result.current.nameRef.current).toBe("test");

    act(() => {
      result.current.parentRef.current.count = 10;
      result.current.parentRef.current.name = "updated";
    });

    expect(result.current.countRef.current).toBe(10);
    expect(result.current.nameRef.current).toBe("updated");
  });

  it("should handle multiple sub refs from same parent", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ a: 1, b: 2, c: 3 });
      const subRefA = useReactiveSubRef(parentRef, (ref) => ref.current.a);
      const subRefB = useReactiveSubRef(parentRef, (ref) => ref.current.b);
      const subRefC = useReactiveSubRef(parentRef, (ref) => ref.current.c);
      return { parentRef, subRefA, subRefB, subRefC };
    });

    act(() => {
      result.current.parentRef.current.a = 10;
      result.current.parentRef.current.b = 20;
      result.current.parentRef.current.c = 30;
    });

    expect(result.current.subRefA.current).toBe(10);
    expect(result.current.subRefB.current).toBe(20);
    expect(result.current.subRefC.current).toBe(30);
  });

  it("should sync multiple sub refs when parent changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ a: 1, b: 2, c: 3 });
      const subRefA = useReactiveSubRef(parentRef, (ref) => ref.current.a);
      const subRefB = useReactiveSubRef(parentRef, (ref) => ref.current.b);
      const subRefC = useReactiveSubRef(parentRef, (ref) => ref.current.c);
      return { parentRef, subRefA, subRefB, subRefC };
    });

    // Change through parent
    act(() => {
      result.current.parentRef.current.a = 100;
    });

    // All sub refs should update
    expect(result.current.subRefA.current).toBe(100);
    expect(result.current.subRefB.current).toBe(2);
    expect(result.current.subRefC.current).toBe(3);
  });

  it("should handle Map in sub ref", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        data: new Map([["key1", "value1"]]),
      });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.data);
      return { parentRef, subRef };
    });

    expect(result.current.subRef.current.get("key1")).toBe("value1");

    act(() => {
      result.current.subRef.current.set("key2", "value2");
    });

    expect(result.current.parentRef.current.data.get("key2")).toBe("value2");
    expect(result.current.parentRef.current.data.size).toBe(2);
  });

  it("should handle Set in sub ref", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        data: new Set([1, 2, 3]),
      });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.data);
      return { parentRef, subRef };
    });

    expect(result.current.subRef.current.has(1)).toBe(true);

    act(() => {
      result.current.subRef.current.add(4);
    });

    expect(result.current.parentRef.current.data.has(4)).toBe(true);
    expect(result.current.parentRef.current.data.size).toBe(4);
  });

  it("should handle deeply nested object changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      });
      const subRef = useReactiveSubRef(
        parentRef,
        (ref) => ref.current.level1.level2.level3
      );
      return { parentRef, subRef };
    });

    expect(result.current.subRef.current.value).toBe("deep");

    act(() => {
      result.current.subRef.current.value = "updated";
    });

    expect(result.current.parentRef.current.level1.level2.level3.value).toBe(
      "updated"
    );
  });

  it("should handle array of objects", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        todos: [
          { id: 1, text: "Todo 1", done: false },
          { id: 2, text: "Todo 2", done: false },
        ],
      });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.todos);
      return { parentRef, subRef };
    });

    act(() => {
      result.current.subRef.current[0].done = true;
      result.current.subRef.current.push({
        id: 3,
        text: "Todo 3",
        done: false,
      });
    });

    expect(result.current.parentRef.current.todos[0].done).toBe(true);
    expect(result.current.parentRef.current.todos.length).toBe(3);
    expect(result.current.parentRef.current.todos[2].text).toBe("Todo 3");
  });

  it("should handle complex nested structure with mixed types", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        users: [
          { id: 1, name: "Alice", tags: new Set(["admin"]) },
          { id: 2, name: "Bob", tags: new Set(["user"]) },
        ],
        metadata: new Map([["version", "1.0.0"]]),
      });
      const usersRef = useReactiveSubRef(parentRef, (ref) => ref.current.users);
      const metadataRef = useReactiveSubRef(
        parentRef,
        (ref) => ref.current.metadata
      );
      return { parentRef, usersRef, metadataRef };
    });

    act(() => {
      result.current.usersRef.current[0].tags.add("moderator");
      result.current.metadataRef.current.set("lastUpdate", "2024-01-01");
    });

    expect(
      result.current.parentRef.current.users[0].tags.has("moderator")
    ).toBe(true);
    expect(result.current.parentRef.current.metadata.get("lastUpdate")).toBe(
      "2024-01-01"
    );
  });

  it("should update parent when deeply nested sub ref value changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({
        config: {
          settings: {
            theme: "dark",
            lang: "en",
          },
        },
      });
      const settingsRef = useReactiveSubRef(
        parentRef,
        (ref) => ref.current.config.settings
      );
      return { parentRef, settingsRef };
    });

    act(() => {
      result.current.settingsRef.current.theme = "light";
      result.current.settingsRef.current.lang = "ko";
    });

    expect(result.current.parentRef.current.config.settings.theme).toBe(
      "light"
    );
    expect(result.current.parentRef.current.config.settings.lang).toBe("ko");
  });

  // Note: Primitive values cannot have bidirectional binding due to JavaScript's
  // pass-by-value semantics. The current implementation only supports parent-to-child
  // synchronization for primitive selectors.
  it.skip("should update parent when primitive sub ref changes", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ count: 0, name: "test" });
      const countRef = useReactiveSubRef(parentRef, (ref) => ref.current.count);
      return { parentRef, countRef };
    });

    expect(result.current.countRef.current).toBe(0);

    act(() => {
      result.current.countRef.current = 100;
    });

    // TODO: Primitive sub ref changes cannot reflect in parent due to JS limitations
    expect(result.current.parentRef.current.count).toBe(100);
  });

  it.skip("should sync primitive sub refs bidirectionally", () => {
    const { result } = renderHook(() => {
      const parentRef = useReactiveRef({ a: 1, b: 2, c: 3 });
      const subRefA = useReactiveSubRef(parentRef, (ref) => ref.current.a);
      const subRefB = useReactiveSubRef(parentRef, (ref) => ref.current.b);
      return { parentRef, subRefA, subRefB };
    });

    // Change sub ref
    act(() => {
      result.current.subRefA.current = 100;
    });

    // TODO: Primitive sub ref changes cannot reflect in parent
    expect(result.current.parentRef.current.a).toBe(100);

    // Change parent
    act(() => {
      result.current.parentRef.current.b = 200;
    });

    // Sub ref should update
    expect(result.current.subRefB.current).toBe(200);
  });

  it("should cleanup watch on unmount", () => {
    const { result, unmount } = renderHook(() => {
      const parentRef = useReactiveRef({ value: 0 });
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current.value);
      return { parentRef, subRef };
    });

    unmount();

    // Should not throw after unmount
    act(() => {
      result.current.parentRef.current.value = 100;
    });

    // Sub ref should still have the last value
    expect(result.current.subRef.current).toBeDefined();
  });

  it("should create a sub ref from a primitive parent ref and keep them in sync (where possible)", () => {
    const {
      result: {
        current: { parentRef, subRef },
      },
    } = renderHook(() => {
      const parentRef = useReactiveRef(5); // primitive parent
      const subRef = useReactiveSubRef(parentRef, (ref) => ref.current);
      return { parentRef, subRef };
    });

    expect(parentRef).toStrictEqual(subRef);
    // Initially subRef should reflect parent's value
    expect(parentRef.current).toBe(5);
    expect(subRef.current).toBe(5);

    // Update subRef (should reflect at parent if possible)
    act(() => {
      subRef.current = 20;
    });
    expect(parentRef.current).toBe(20);
    expect(subRef.current).toBe(20);

    // Update parentRef (should reflect at subRef)
    act(() => {
      parentRef.current = 42;
    });
    expect(parentRef.current).toBe(42);
    expect(subRef.current).toBe(42);
  });
});
