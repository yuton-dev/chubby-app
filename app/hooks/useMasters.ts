"use client";

import { useCallback, useEffect, useState } from "react";
import { getMasters } from "../lib/api";
import type { Master } from "../lib/types";

export type UseMastersResult = {
  masters: Master[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useMasters(): UseMastersResult {
  const [masters, setMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMasters();
      setMasters(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("マスター一覧の取得に失敗しました。"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      void refetch();
    }, 0);

    return () => {
      clearTimeout(timerId);
    };
  }, [refetch]);

  return { masters, isLoading, error, refetch };
}

export default useMasters;
