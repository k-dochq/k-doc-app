import { useState, useEffect } from "react";

const MINIMUM_SPLASH_DURATION = 1500;

export function useSplashTimer() {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MINIMUM_SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return {
    minTimeElapsed,
  };
}
