'use client';

import { useCallback, useRef, useState } from 'react';

export interface CircuitBreakerState {
  isTripped: boolean;
  renderCount: number;
  trace: string[];
}

export interface CircuitBreakerConfig {
  maxRenders: number;
  timeWindowMs: number;
}

export interface UseCircuitBreakerReturn {
  isTripped: boolean;
  trackRender: (label?: string) => void;
  reset: () => void;
  trace: string[];
  renderCount: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  maxRenders: 50,
  timeWindowMs: 1000,
};

/**
 * Circuit breaker hook to detect infinite render loops
 *
 * Tracks render count within a sliding time window. If renders exceed
 * maxRenders within timeWindowMs, the circuit "trips" and returns true.
 *
 * Usage:
 * ```tsx
 * const { isTripped, trackRender, reset, trace } = useCircuitBreaker();
 *
 * useEffect(() => {
 *   trackRender('some-effect');
 * }, [dependencies]);
 *
 * if (isTripped) {
 *   console.error('Circuit tripped! Trace:', trace);
 *   return <ErrorUI onRetry={reset} />;
 * }
 * ```
 */
export function useCircuitBreaker(
  config: Partial<CircuitBreakerConfig> = {}
): UseCircuitBreakerReturn {
  const { maxRenders, timeWindowMs } = { ...DEFAULT_CONFIG, ...config };

  const [isTripped, setIsTripped] = useState(false);
  const renderTimestampsRef = useRef<number[]>([]);
  const traceRef = useRef<string[]>([]);
  const [trace, setTrace] = useState<string[]>([]);
  const [renderCount, setRenderCount] = useState(0);

  const trackRender = useCallback(
    (label?: string) => {
      const now = Date.now();

      // Add trace entry
      const traceEntry = `[${new Date(now).toISOString()}] ${label || 'render'}`;
      traceRef.current.push(traceEntry);

      // Keep only recent traces (last 100)
      if (traceRef.current.length > 100) {
        traceRef.current = traceRef.current.slice(-100);
      }

      // Add timestamp
      renderTimestampsRef.current.push(now);

      // Filter to only timestamps within the time window
      const windowStart = now - timeWindowMs;
      renderTimestampsRef.current = renderTimestampsRef.current.filter((ts) => ts >= windowStart);

      const currentRenderCount = renderTimestampsRef.current.length;
      setRenderCount(currentRenderCount);

      // Check if circuit should trip
      if (currentRenderCount > maxRenders && !isTripped) {
        setIsTripped(true);
        setTrace([...traceRef.current]);
        console.error(
          `[CircuitBreaker] TRIPPED: ${currentRenderCount} renders in ${timeWindowMs}ms (max: ${maxRenders})`,
          '\nRecent trace:',
          traceRef.current.slice(-20)
        );
      }
    },
    [maxRenders, timeWindowMs, isTripped]
  );

  const reset = useCallback(() => {
    setIsTripped(false);
    renderTimestampsRef.current = [];
    traceRef.current = [];
    setTrace([]);
    setRenderCount(0);
  }, []);

  return {
    isTripped,
    trackRender,
    reset,
    trace,
    renderCount,
  };
}
