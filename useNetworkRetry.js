import { useEffect, useRef, useState } from "react";
import { useNetworkState } from "expo-network";

const NETWORK_ERROR_PATTERN =
  /network request failed|failed to fetch|fetch failed|network error|load failed|internet connection/;

export function isNetworkError(error) {
  const message = typeof error === "string" ? error : error?.message;
  return (
    typeof message === "string" &&
    NETWORK_ERROR_PATTERN.test(message.toLowerCase())
  );
}

export default function useNetworkRetry() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const [retryKey, setRetryKey] = useState(0);
  const wasOfflineRef = useRef(false);
  const isOffline =
    isConnected === false || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      wasOfflineRef.current = true;
      return;
    }

    if (
      wasOfflineRef.current &&
      (isConnected === true || isInternetReachable === true)
    ) {
      wasOfflineRef.current = false;
      setRetryKey((current) => current + 1);
    }
  }, [isConnected, isInternetReachable, isOffline]);

  return { isOffline, retryKey };
}
