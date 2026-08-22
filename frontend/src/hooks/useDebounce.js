import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any rapidly changing value
 * @param {*} value - The input value to debounce (e.g. search string)
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {*} debouncedValue - The value after the delay has passed
 */
export function useDebounce(value, delay = 400) {
  // 1. State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 2. Set up timer to update debouncedValue after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 3. Cleanup function: cancels timeout if value or delay changes before timer completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}

export default useDebounce;
