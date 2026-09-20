import { useCallback, useEffect, useRef, useState } from 'react';

// Loads data when the component mounts (and when `deps` change).
//   const { data, loading, error, reload } = useFetch(() => api(), [dep]);
// reload({ silent: true }) refreshes in the background: the old data stays on screen (used after actions and for polling).
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const silent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!silent.current) setState({ data: null, loading: true, error: null });
    silent.current = false;
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((err) => {
        if (cancelled) return;
        // keep the old data during a failed background refresh
        setState((s) => ({ data: s.data, loading: false, error: err.message }));
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback((options = {}) => {
    silent.current = Boolean(options.silent);
    setTick((t) => t + 1);
  }, []);

  return { ...state, reload };
}

// Calls `callback` every `ms` milliseconds while the component is mounted.
export function usePolling(callback, ms, enabled = true) {
  const saved = useRef(callback);
  saved.current = callback;
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
}
