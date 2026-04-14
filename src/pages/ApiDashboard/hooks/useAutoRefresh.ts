import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoRefresh(onRefresh: () => void) {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval_] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(onRefresh);

  callbackRef.current = onRefresh;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (enabled) {
      timerRef.current = setInterval(() => {
        callbackRef.current();
      }, interval * 1000);
    }
    return clearTimer;
  }, [enabled, interval, clearTimer]);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const setRefreshInterval = useCallback((seconds: number) => {
    setInterval_(seconds);
  }, []);

  const manualRefresh = useCallback(() => {
    callbackRef.current();
  }, []);

  return {
    enabled,
    interval,
    toggleEnabled,
    setRefreshInterval,
    manualRefresh,
  };
}
