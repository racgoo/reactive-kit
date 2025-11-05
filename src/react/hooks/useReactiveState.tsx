import { watch } from "@vue/reactivity";
import { useEffect, useState } from "react";
import type { ReactiveRef } from "./useReactiveRef";
import { shallowCopy } from "@react/utils/shallowCopy";

function useReactiveState<T>(selector: () => T): T;
function useReactiveState<T>(reactiveRef: ReactiveRef<T>): T;

function useReactiveState<T>(arg: ReactiveRef<T> | (() => T)): T {
  switch (typeof arg === "function" ? "function" : "ref") {
    case "function":
      return useReactiveSelectorState(arg as () => T);
    case "ref":
      return useReactiveRefState(arg as ReactiveRef<T>);
  }
}

//single reactive ref as state
function useReactiveRefState<T>(reactiveRef: ReactiveRef<T>): T {
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

//composition of reactive ref with selector as state
function useReactiveSelectorState<T>(selector: () => T): T {
  const [state, setState] = useState(() => shallowCopy(selector()));
  watch(
    () => selector(),
    (newVal) => {
      setState(shallowCopy(newVal));
    },
    {
      deep: true,
    }
  );
  return state;
}

export { useReactiveState };
