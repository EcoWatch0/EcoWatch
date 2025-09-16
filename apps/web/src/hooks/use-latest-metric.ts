'use client';
import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';

export type LatestMetric = { time: string; value: number; unit?: string; type?: string } | null;

export function useLatestMetric(params: { sensorId?: string; type?: string; orgId?: string; orgBucket?: string }) {
  const { sensorId, type = 'temperature', orgId, orgBucket } = params;
  const [data, setData] = useState<LatestMetric>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = process.env.NEXT_PUBLIC_API_URL;

  const fetchLatest = useCallback(async () => {
    if (!sensorId) return;
    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token') as string | undefined;
      const search = new URLSearchParams({ type, ...(orgId ? { orgId } : {}), ...(orgBucket ? { orgBucket } : {}) });
      const res = await fetch(`${api}/metrics/sensors/${sensorId}/latest?${search.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });
      const json = await res.json();
      setData(json ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, sensorId, type, orgId, orgBucket]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  return { data, loading, error, refetch: fetchLatest };
}

