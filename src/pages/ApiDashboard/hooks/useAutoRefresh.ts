import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoRefresh(onRefresh: () => void) {
  const [enabled, setEnabled] = useState(false);
  const [interval, setIntervalValue] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (enabled) {
      timerRef.current = setInterval(() => {
        onRefreshRef.current();
      }, interval * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const setInterval_ = useCallback((val: number) => {
    setIntervalValue(val);
  }, []);

  const manualRefresh = useCallback(() => {
    onRefreshRef.current();
  }, []);

  return {
    enabled,
    interval,
    toggle,
    setInterval: setInterval_,
    manualRefresh,
  };
}
