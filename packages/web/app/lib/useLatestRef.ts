import { useEffect, useLayoutEffect, useRef } from "react";

// Make SSR'd stuff happy
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}
