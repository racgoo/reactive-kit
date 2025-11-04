import { reactive, watch } from "@vue/reactivity";
import { useEffect, useMemo, type MutableRefObject } from "react";

interface ReactiveSelector<T, K> {
  (reactiveRef: ReactiveRef<T>): K;
}

type ReactiveRef<T> = MutableRefObject<T>;

function useReactiveRef<T>(initialValue: T): ReactiveRef<T> {
  const wrappedValue = useMemo(
    () => ({ current: initialValue }),
    [initialValue]
  );
  const reactiveValue = useMemo(() => reactive(wrappedValue), []);
  return reactiveValue as ReactiveRef<T>;
}

function useReactiveSubRef<T, K>(
  reactiveRef: ReactiveRef<T>,
  selector: ReactiveSelector<T, K>
): ReactiveRef<K> {
  const selectedRef = useMemo(
    () => selector(reactiveRef),
    [reactiveRef, selector]
  );

  const subReactiveRef: ReactiveRef<K> = useReactiveRef(selectedRef);

  useEffect(() => {
    const stop = watch(
      () => selector(reactiveRef),
      (newVal) => {
        subReactiveRef.current = newVal;
      }
    );
    return () => stop();
  }, [reactiveRef]);

  return subReactiveRef;
}

export { useReactiveRef, useReactiveSubRef };
export type { ReactiveRef };
