import { renderHook, act } from "@testing-library/react";
import { useReactiveRef } from "../useReactiveRef";
import { useReactiveState } from "../useReactiveState";

describe("useReactiveState - Selector Overload", () => {
  it("should work with selector function", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({ count: 0, name: "test" });
      const state = useReactiveState(() => ref.current.count);
      return { ref, state };
    });

    expect(result.current.state).toBe(0);

    act(() => {
      result.current.ref.current.count = 10;
    });

    expect(result.current.state).toBe(10);
  });

  it("should combine multiple refs with selector", () => {
    const { result } = renderHook(() => {
      const ref1 = useReactiveRef(5);
      const ref2 = useReactiveRef(10);
      const sum = useReactiveState(() => ref1.current + ref2.current);
      return { ref1, ref2, sum };
    });

    expect(result.current.sum).toBe(15);

    act(() => {
      result.current.ref1.current = 10;
    });

    expect(result.current.sum).toBe(20);

    act(() => {
      result.current.ref2.current = 20;
    });

    expect(result.current.sum).toBe(30);
  });

  it("should create computed state from multiple refs", () => {
    const { result } = renderHook(() => {
      const width = useReactiveRef(10);
      const height = useReactiveRef(5);
      const area = useReactiveState(() => width.current * height.current);
      return { width, height, area };
    });

    expect(result.current.area).toBe(50);

    act(() => {
      result.current.width.current = 20;
    });

    expect(result.current.area).toBe(100);

    act(() => {
      result.current.height.current = 10;
    });

    expect(result.current.area).toBe(200);
  });

  it("should handle conditional selector logic", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef(5);
      const state = useReactiveState(() => (ref.current > 10 ? "high" : "low"));
      return { ref, state };
    });

    expect(result.current.state).toBe("low");

    act(() => {
      result.current.ref.current = 15;
    });

    expect(result.current.state).toBe("high");

    act(() => {
      result.current.ref.current = 3;
    });

    expect(result.current.state).toBe("low");
  });

  it("should handle object transformation with selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({
        firstName: "John",
        lastName: "Doe",
        age: 30,
      });
      const fullName = useReactiveState(
        () => `${ref.current.firstName} ${ref.current.lastName}`
      );
      return { ref, fullName };
    });

    expect(result.current.fullName).toBe("John Doe");

    act(() => {
      result.current.ref.current.firstName = "Jane";
    });

    expect(result.current.fullName).toBe("Jane Doe");

    act(() => {
      result.current.ref.current.lastName = "Smith";
    });

    expect(result.current.fullName).toBe("Jane Smith");
  });

  it("should handle array filtering with selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef([1, 2, 3, 4, 5]);
      const evenNumbers = useReactiveState(() =>
        ref.current.filter((n) => n % 2 === 0)
      );
      return { ref, evenNumbers };
    });

    expect(result.current.evenNumbers).toEqual([2, 4]);

    act(() => {
      result.current.ref.current.push(6);
    });

    expect(result.current.evenNumbers).toEqual([2, 4, 6]);
  });

  it("should handle array mapping with selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef([
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ]);
      const names = useReactiveState(() =>
        ref.current.map((user) => user.name)
      );
      return { ref, names };
    });

    expect(result.current.names).toEqual(["Alice", "Bob"]);

    act(() => {
      result.current.ref.current.push({ id: 3, name: "Charlie" });
    });

    expect(result.current.names).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should handle nested object selection", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({
        user: {
          profile: {
            name: "John",
            age: 30,
          },
        },
      });
      const userName = useReactiveState(() => ref.current.user.profile.name);
      return { ref, userName };
    });

    expect(result.current.userName).toBe("John");

    act(() => {
      result.current.ref.current.user.profile.name = "Jane";
    });

    expect(result.current.userName).toBe("Jane");
  });

  it("should handle Map size with selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef(new Map([["key1", "value1"]]));
      const size = useReactiveState(() => ref.current.size);
      return { ref, size };
    });

    expect(result.current.size).toBe(1);

    act(() => {
      result.current.ref.current.set("key2", "value2");
    });

    expect(result.current.size).toBe(2);
  });

  it("should handle Set operations with selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef(new Set([1, 2, 3]));
      const hasValue = useReactiveState(() => ref.current.has(5));
      return { ref, hasValue };
    });

    expect(result.current.hasValue).toBe(false);

    act(() => {
      result.current.ref.current.add(5);
    });

    expect(result.current.hasValue).toBe(true);
  });

  it("should handle complex computation with selector", () => {
    const { result } = renderHook(() => {
      const items = useReactiveRef([
        { name: "item1", price: 10, quantity: 2 },
        { name: "item2", price: 20, quantity: 1 },
      ]);
      const total = useReactiveState(() =>
        items.current.reduce((sum, item) => sum + item.price * item.quantity, 0)
      );
      return { items, total };
    });

    expect(result.current.total).toBe(40); // (10*2) + (20*1)

    act(() => {
      result.current.items.current[0].quantity = 3;
    });

    expect(result.current.total).toBe(50); // (10*3) + (20*1)
  });

  it("should handle selector with multiple nested refs", () => {
    const { result } = renderHook(() => {
      const user = useReactiveRef({ name: "John", age: 30 });
      const settings = useReactiveRef({ theme: "dark", lang: "en" });
      const summary = useReactiveState(() => ({
        userName: user.current.name,
        userAge: user.current.age,
        theme: settings.current.theme,
      }));
      return { user, settings, summary };
    });

    expect(result.current.summary).toEqual({
      userName: "John",
      userAge: 30,
      theme: "dark",
    });

    act(() => {
      result.current.user.current.name = "Jane";
    });

    expect(result.current.summary.userName).toBe("Jane");

    act(() => {
      result.current.settings.current.theme = "light";
    });

    expect(result.current.summary.theme).toBe("light");
  });

  it("should shallow copy object result from selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({ data: { value: 10 } });
      const state = useReactiveState(() => ref.current.data);
      return { ref, state };
    });

    const firstState = result.current.state;

    act(() => {
      result.current.ref.current.data.value = 20;
    });

    const secondState = result.current.state;

    // Shallow copy로 새로운 객체여야 함
    expect(firstState).not.toBe(secondState);
    expect(secondState.value).toBe(20);
  });

  it("should shallow copy array result from selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef([1, 2, 3]);
      const state = useReactiveState(() => ref.current);
      return { ref, state };
    });

    const firstState = result.current.state;

    act(() => {
      result.current.ref.current.push(4);
    });

    const secondState = result.current.state;

    // Shallow copy로 새로운 배열이어야 함
    expect(firstState).not.toBe(secondState);
    expect(secondState).toEqual([1, 2, 3, 4]);
  });

  it("should handle selector returning primitive values", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({ count: 0 });
      const doubled = useReactiveState(() => ref.current.count * 2);
      return { ref, doubled };
    });

    expect(result.current.doubled).toBe(0);

    act(() => {
      result.current.ref.current.count = 5;
    });

    expect(result.current.doubled).toBe(10);
  });

  it("should handle selector with boolean logic", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef({ isActive: false, count: 0 });
      const canProceed = useReactiveState(
        () => ref.current.isActive && ref.current.count > 0
      );
      return { ref, canProceed };
    });

    expect(result.current.canProceed).toBe(false);

    act(() => {
      result.current.ref.current.isActive = true;
    });

    expect(result.current.canProceed).toBe(false); // count is still 0

    act(() => {
      result.current.ref.current.count = 5;
    });

    expect(result.current.canProceed).toBe(true);
  });

  it("should not update when selector result is the same", () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      const ref = useReactiveRef({ count: 5, other: "value" });
      const count = useReactiveState(() => ref.current.count);
      renderCount++;
      return { ref, count };
    });

    const initialRenderCount = renderCount;

    act(() => {
      result.current.ref.current.other = "new value";
    });

    // count는 변경되지 않았으므로 리렌더 발생하지 않아야 함
    expect(renderCount).toBe(initialRenderCount);
  });

  it("should work with Date objects in selector", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef(new Date("2024-01-01"));
      const year = useReactiveState(() => ref.current.getFullYear());
      return { ref, year };
    });

    expect(result.current.year).toBe(2024);

    act(() => {
      result.current.ref.current = new Date("2025-01-01");
    });

    expect(result.current.year).toBe(2025);
  });

  it("should handle selector with null/undefined values", () => {
    const { result } = renderHook(() => {
      const ref = useReactiveRef<{ value: number | null }>({ value: null });
      const hasValue = useReactiveState(() => ref.current.value !== null);
      return { ref, hasValue };
    });

    expect(result.current.hasValue).toBe(false);

    act(() => {
      result.current.ref.current.value = 10;
    });

    expect(result.current.hasValue).toBe(true);
  });

  it("should cleanup watch on unmount for useReactiveSelectorState", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef({ count: 0 })
    );
    const stateHistory: number[] = [];

    const { result: stateResult, unmount } = renderHook(() => {
      const state = useReactiveState(() => refResult.current.current.count);
      stateHistory.push(state);
      return state;
    });

    // 초기 렌더링 후 상태 초기화
    stateHistory.length = 0;

    // 마운트 상태에서 변경 시 콜백 호출 확인
    act(() => {
      refResult.current.current.count = 10;
    });

    expect(stateResult.current).toBe(10);
    const stateCountBeforeUnmount = stateHistory.length;

    // 언마운트
    unmount();

    // 언마운트 후 변경 시 콜백이 호출되지 않아야 함
    act(() => {
      refResult.current.current.count = 100;
    });

    // state는 마지막 값으로 고정되어야 함 (업데이트되지 않음)
    expect(stateResult.current).toBe(10);
    // 언마운트 후에는 state가 업데이트되지 않으므로 stateHistory 길이가 증가하지 않아야 함
    expect(stateHistory.length).toBe(stateCountBeforeUnmount);
  });

  it("should cleanup watch for useReactiveState overload (selector)", () => {
    const { result: refResult } = renderHook(() =>
      useReactiveRef({ value: 0 })
    );
    const stateHistory: number[] = [];

    const { result: stateResult, unmount } = renderHook(() => {
      const state = useReactiveState(() => refResult.current.current.value);
      stateHistory.push(state);
      return state;
    });

    // 초기 렌더링 후 상태 초기화
    stateHistory.length = 0;

    // 마운트 상태에서 변경
    act(() => {
      refResult.current.current.value = 10;
    });

    expect(stateResult.current).toBe(10);
    const stateCountBeforeUnmount = stateHistory.length;

    // 언마운트
    unmount();

    // 언마운트 후 변경 시 업데이트되지 않아야 함
    act(() => {
      refResult.current.current.value = 100;
    });

    expect(stateResult.current).toBe(10);
    expect(stateHistory.length).toBe(stateCountBeforeUnmount);
  });

  it("should cleanup watch when component unmounts and prevent memory leaks", () => {
    const { result: refResult } = renderHook(() => useReactiveRef(0));
    const watchCallbacks: number[] = [];

    const { unmount } = renderHook(() => {
      const state = useReactiveState(() => refResult.current.current);
      watchCallbacks.push(state);
      return state;
    });

    // 마운트 상태에서 변경
    act(() => {
      refResult.current.current = 5;
    });

    const callbacksBeforeUnmount = watchCallbacks.length;

    // 언마운트
    unmount();

    // 여러 번 변경해도 콜백이 호출되지 않아야 함
    act(() => {
      refResult.current.current = 10;
      refResult.current.current = 20;
      refResult.current.current = 30;
    });

    // 언마운트 후에는 새로운 콜백이 호출되지 않아야 함
    expect(watchCallbacks.length).toBe(callbacksBeforeUnmount);
  });
});
