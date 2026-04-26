"use client";

import { useCallback, useEffect, useState } from "react";
import { getFeedRireki } from "../lib/api";
import type { Feed } from "../lib/types";

export type UseFeedsResult = {
  feeds: Feed[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useFeeds(chubbyId: string, date?: string): UseFeedsResult {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!chubbyId) {
      setFeeds([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getFeedRireki(chubbyId, date);
      setFeeds(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("ごはん履歴の取得に失敗しました。"));
    } finally {
      setIsLoading(false);
    }
  }, [chubbyId, date]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      void refetch();
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [refetch]);

  return { feeds, isLoading, error, refetch };
}

export default useFeeds;
