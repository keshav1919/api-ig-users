import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialSeconds = 120, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isRunning]);

  const reset = useCallback((newSeconds = initialSeconds) => {
    setTimeLeft(newSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = timeLeft <= 0;

  return {
    timeLeft,
    formattedTime,
    isExpired,
    isRunning,
    reset,
    pause,
    resume,
  };
};

export default useTimer;
