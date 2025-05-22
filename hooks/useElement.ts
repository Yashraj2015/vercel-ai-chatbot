// hooks/useElementSize.ts
import { useState, useLayoutEffect } from 'react';

export const useElementSize = (ref: React.RefObject<HTMLElement>) => {
  const [size, setSize] = useState({ width: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};
