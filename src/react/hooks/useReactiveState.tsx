import { watch } from "@vue/reactivity";
import { useEffect, useState } from "react";
import type { ReactiveRef } from "./useReactiveRef";

function shallowCopyValue<T>(value: T): T {
  if (value instanceof Map) {
    return new Map(value) as T;
  }
  if (value instanceof Set) {
    return new Set(value) as T;
  }
  if (value instanceof Date) {
    return new Date(value) as T;
  }
  if (Array.isArray(value)) {
    return [...value] as T;
  }
  if (value && typeof value === "object") {
    return { ...value } as T;
  }
  return value;
}

function useReactiveState<T>(reactiveRef: ReactiveRef<T>): T {
  const [state, setState] = useState(() =>
    shallowCopyValue(reactiveRef.current)
  );

  useEffect(() => {
    const stop = watch(
      () => reactiveRef,
      (newVal) => {
        setState(shallowCopyValue(newVal.current));
      },
      {
        deep: true,
      }
    );
    return () => stop();
  }, [reactiveRef]);

  return state;
}

export { useReactiveState };
