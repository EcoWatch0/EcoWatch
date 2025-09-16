'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SensorHistory({ sensorId, type = 'temperature', orgId, orgBucket }: { sensorId: string; type?: string; orgId?: string; orgBucket?: string }) {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie('token') as string | undefined;
        const params = new URLSearchParams({ type, range: '-2h', ...(orgId ? { orgId } : {}), ...(orgBucket ? { orgBucket } : {}) });
        const res = await fetch(`${api}/metrics/sensors/${sensorId}/history?${params.toString()}`, {
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        setData(json);
      } catch {
        /* noop */
      }
    };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, [api, sensorId, type]);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

