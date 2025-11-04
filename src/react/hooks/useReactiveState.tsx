import { watch } from "@vue/reactivity";
import { useEffect, useState } from "react";
import type { ReactiveRef } from "./useReactiveRef";
import { shallowCopy } from "@react/utils/shallowCopy";

function useReactiveState<T>(reactiveRef: ReactiveRef<T>): T {
  const [state, setState] = useState(() => shallowCopy(reactiveRef.current));

  useEffect(() => {
    const stop = watch(
      () => reactiveRef,
      (newVal) => {
        setState(shallowCopy(newVal.current));
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
