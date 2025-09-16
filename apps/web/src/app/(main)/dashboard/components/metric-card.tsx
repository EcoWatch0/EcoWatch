'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLatestMetric } from '@/hooks/use-latest-metric';
import { getCookie } from 'cookies-next';
import { useEffect, useMemo, useState } from 'react';

export function MetricCard({ title, orgId, type, icon }: { title: string; orgId?: string; type: string; icon?: React.ReactNode }) {
  const [orgBucket, setOrgBucket] = useState<string | undefined>(undefined);
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fn = async () => {
      if (!orgId) { setOrgBucket(undefined); return; }
      try {
        const token = getCookie('token') as string | undefined;
        const res = await fetch(`${api}/organizations/${orgId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const json = await res.json();
        setOrgBucket(json?.influxBucketName);
      } catch { /* noop */ }
    };
    fn();
  }, [api, orgId]);

  const { data } = useLatestMetric({ sensorId: undefined, type, orgId, orgBucket });

  const valueText = useMemo(() => {
    if (!data) return '—';
    const unit = data.unit ? ` ${data.unit}` : '';
    return `${data.value}${unit}`;
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}{title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{valueText}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dernière mesure</p>
      </CardContent>
    </Card>
  );
}

