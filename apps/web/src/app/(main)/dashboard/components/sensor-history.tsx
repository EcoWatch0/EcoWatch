'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SensorHistory({ sensorId, type = 'temperature' }: { sensorId: string; type?: string }) {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/metrics/sensors/${sensorId}/history?type=${type}&range=-2h`, { cache: 'no-store' });
        const json = await res.json();
        setData(json);
      } catch (e) {
        // ignore
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

