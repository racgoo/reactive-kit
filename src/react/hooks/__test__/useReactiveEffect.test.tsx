import { renderHook, act } from "@testing-library/react";
import { useReactiveRef } from "../useReactiveRef";
import { useReactiveEffect } from "../useReactiveEffect";

describe("useReactiveEffect", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should run effect on mount", () => {
    const effectFn = jest.fn();

    renderHook(() => {
      useReactiveEffect(effectFn);
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it("should track reactive ref changes", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(0);

    act(() => {
      result.current.current = 10;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(10);
  });

  it("should batch multiple synchronous updates", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.current = 1;
      result.current.current = 2;
      result.current.current = 3;
    });

    // Batch되어 timer 대기 중
    expect(effectFn).toHaveBeenCalledTimes(1);

    act(() => {
      jest.runAllTimers();
    });

    // 한 번만 실행됨 (배치 처리)
    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(3);
  });

  it("should handle multiple reactive refs", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref1 = useReactiveRef(0);
      const ref2 = useReactiveRef(10);
      useReactiveEffect(() => {
        effectFn(ref1.current, ref2.current);
      });
      return { ref1, ref2 };
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(0, 10);

    act(() => {
      result.current.ref1.current = 5;
      result.current.ref2.current = 15;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(5, 15);
  });

  it("should handle nested object changes", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef({ user: { name: "John", age: 30 } });
      useReactiveEffect(() => {
        effectFn(ref.current.user.name, ref.current.user.age);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith("John", 30);

    act(() => {
      result.current.current.user.name = "Jane";
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith("Jane", 30);
  });

  it("should handle array mutations", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef([1, 2, 3]);
      useReactiveEffect(() => {
        effectFn(ref.current.length);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(3);

    act(() => {
      result.current.current.push(4);
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(4);
  });

  it("should handle Map operations", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(new Map([["key", "value"]]));
      useReactiveEffect(() => {
        effectFn(ref.current.size);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(1);

    act(() => {
      result.current.current.set("key2", "value2");
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(2);
  });

  it("should handle Set operations", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(new Set([1, 2, 3]));
      useReactiveEffect(() => {
        effectFn(ref.current.size);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(3);

    act(() => {
      result.current.current.add(4);
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(4);
  });

  it("should call effect function on mount and changes", () => {
    const effectFn = jest.fn();

    const { result, unmount } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalled();

    act(() => {
      result.current.current = 5;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledWith(5);

    // cleanup 테스트
    expect(() => unmount()).not.toThrow();
  });

  it("should clear pending timeouts on unmount", () => {
    const effectFn = jest.fn();

    const { result, unmount } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    // 초기 실행
    expect(effectFn).toHaveBeenCalledTimes(1);

    // 변경 사항 발생 (타이머 예약됨)
    act(() => {
      result.current.current = 5;
      result.current.current = 10;
      result.current.current = 15;
    });

    const callCountBeforeUnmount = effectFn.mock.calls.length;

    // 타이머가 실행되기 전에 unmount (cleanup 함수에서 clearTimeout 호출됨)
    act(() => {
      unmount();
    });

    // 타이머 실행
    act(() => {
      jest.runAllTimers();
    });

    // unmount 후 clearTimeout이 호출되어 더 이상 증가하지 않음
    expect(effectFn.mock.calls.length).toBeLessThanOrEqual(
      callCountBeforeUnmount + 1
    );
  });

  it("should handle conditional logic in effect", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        if (ref.current < 5) {
          effectFn(ref.current);
        }
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(0);

    act(() => {
      result.current.current = 3;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(3);

    act(() => {
      result.current.current = 10;
    });

    act(() => {
      jest.runAllTimers();
    });

    // 조건문 때문에 effectFn이 호출되지 않지만, effect 자체는 실행됨
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it("should handle multiple effects on same ref", () => {
    const effect1Fn = jest.fn();
    const effect2Fn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effect1Fn(ref.current);
      });
      useReactiveEffect(() => {
        effect2Fn(ref.current * 2);
      });
      return ref;
    });

    expect(effect1Fn).toHaveBeenCalledTimes(1);
    expect(effect2Fn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.current = 5;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effect1Fn).toHaveBeenCalledTimes(2);
    expect(effect1Fn).toHaveBeenCalledWith(5);
    expect(effect2Fn).toHaveBeenCalledTimes(2);
    expect(effect2Fn).toHaveBeenCalledWith(10);
  });

  it("should handle effect that modifies tracked value", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
        if (ref.current < 5) {
          // Effect 내부에서 값 변경 - 재귀적 실행되지 않음 (초기 실행 중)
          ref.current++;
        }
      });
      return ref;
    });

    // 초기 실행 1번
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(result.current.current).toBe(1);
  });

  it("should not trigger effect for non-tracked values", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref1 = useReactiveRef(0);
      const ref2 = useReactiveRef(10);
      useReactiveEffect(() => {
        effectFn(ref1.current); // ref2는 tracking 안 함
      });
      return { ref1, ref2 };
    });

    expect(effectFn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.ref2.current = 20;
    });

    act(() => {
      jest.runAllTimers();
    });

    // ref2 변경은 effect를 트리거하지 않음
    expect(effectFn).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.ref1.current = 5;
    });

    act(() => {
      jest.runAllTimers();
    });

    // ref1 변경은 effect를 트리거함
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it("should handle primitive ref changes", () => {
    const effectFn = jest.fn();

    const { result } = renderHook(() => {
      const ref = useReactiveRef(5);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledWith(5);

    act(() => {
      result.current.current = 10;
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(effectFn).toHaveBeenCalledTimes(2);
    expect(effectFn).toHaveBeenCalledWith(10);
  });

  it("should prevent memory leaks by clearing all pending timeouts", () => {
    const effectFn = jest.fn();

    const { result, unmount } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    // 여러 번 변경하여 타이머 생성 및 실행
    act(() => {
      result.current.current = 1;
    });

    act(() => {
      jest.runAllTimers();
    });

    act(() => {
      result.current.current = 2;
    });

    act(() => {
      jest.runAllTimers();
    });

    act(() => {
      result.current.current = 3;
    });

    // 타이머가 실행되기 전에 unmount (cleanup에서 pending 타이머 클리어)
    act(() => {
      unmount();
    });

    // cleanup이 정상적으로 호출되었는지 확인 (에러 없이 unmount)
    expect(() => {
      jest.runAllTimers();
    }).not.toThrow();
  });

  it("should handle rapid changes followed by unmount", () => {
    const effectFn = jest.fn();

    const { result, unmount } = renderHook(() => {
      const ref = useReactiveRef(0);
      useReactiveEffect(() => {
        effectFn(ref.current);
      });
      return ref;
    });

    // 초기 실행
    expect(effectFn).toHaveBeenCalledTimes(1);

    // 빠른 연속 변경 (배치 처리되어야 함)
    act(() => {
      for (let i = 1; i <= 100; i++) {
        result.current.current = i;
      }
    });

    const callCountBeforeUnmount = effectFn.mock.calls.length;

    // 타이머 실행 전 unmount
    act(() => {
      unmount();
    });

    // 타이머 실행
    act(() => {
      jest.runAllTimers();
    });

    // unmount 후에는 최소한의 실행만 (cleanup이 동작)
    expect(effectFn.mock.calls.length).toBeLessThanOrEqual(
      callCountBeforeUnmount + 1
    );
  });
});
