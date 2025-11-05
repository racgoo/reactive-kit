import { effect } from "@vue/reactivity";
import { useEffect } from "react";

function useReactiveEffect(effectCallback: () => void) {
  useEffect(() => {
    let isPending = false;
    let currentScheduleId = 0;
    const sheduleIdTimeoutIdMap = new Map<number, number>();
    const scheduler = () => {
      if (isPending) return;
      isPending = true;
      currentScheduleId++;
      //macroTaskQueue

      const timeoutId = setTimeout(() => {
        isPending = false;
        sheduleIdTimeoutIdMap.delete(currentScheduleId);
        effectCallback();
      }, 0);
      sheduleIdTimeoutIdMap.set(currentScheduleId, timeoutId);
    };
    const stopEffect = effect(effectCallback, {
      scheduler: scheduler,
      onTrigger: scheduler,
    });
    return () => {
      sheduleIdTimeoutIdMap.forEach((timeoutId) => {
        globalThis.clearTimeout(timeoutId);
      });
      stopEffect();
    };
  }, [effectCallback]);
}

export { useReactiveEffect };
