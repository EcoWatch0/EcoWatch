'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCookie } from 'cookies-next';
import { SensorHistory } from './sensor-history';

type Sensor = { id: string; name: string; type: string; organizationId?: string; orgBucket?: string };

export function SensorsGrid() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const token = getCookie('token') as string | undefined;
        const res = await fetch(`${api}/sensors`, {
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        setSensors(Array.isArray(json) ? json : []);
      } catch {
        /* noop */
      }
    };
    fetchSensors();
  }, [api]);

  const gridCols = useMemo(() => {
    const count = sensors.length;
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }, [sensors.length]);

  if (!sensors.length) {
    return (
      <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">Aucun capteur actif.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {sensors.map((sensor) => (
        <Card key={sensor.id}>
          <CardHeader>
            <CardTitle>
              {sensor.name} ({sensor.type.toLowerCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SensorHistory
              sensorId={sensor.id}
              type={sensor.type.toLowerCase()}
              orgId={sensor.organizationId}
              orgBucket={sensor.orgBucket}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

