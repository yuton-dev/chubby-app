"use client";

import { useCallback, useEffect, useState } from "react";
import { getChubbies } from "../lib/api";
import type { Chubby } from "../lib/types";

export type UseChubbiesResult = {
  chubbies: Chubby[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useChubbies(masterId?: string): UseChubbiesResult {
  const [chubbies, setChubbies] = useState<Chubby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getChubbies(masterId);
      setChubbies(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Chubby一覧の取得に失敗しました。"));
    } finally {
      setIsLoading(false);
    }
  }, [masterId]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      void refetch();
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [refetch]);

  return { chubbies, isLoading, error, refetch };
}

export default useChubbies;
