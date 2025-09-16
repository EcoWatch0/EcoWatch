'use client';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Organization = { id: string; name: string; influxBucketName?: string };

export function OrganizationSelector({ value, onChange }: { value?: string; onChange: (org: Organization | null) => void }) {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const api = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const token = getCookie('token') as string | undefined;
        const res = await fetch(`${api}/organizations/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const json = await res.json();
        setOrgs(Array.isArray(json) ? json : []);
        if (!value && Array.isArray(json) && json.length > 0) {
          onChange(json[0]);
        }
      } catch {
        /* noop */
      }
    };
    fetchOrgs();
  }, [api]);

  return (
    <Select
      value={value}
      onValueChange={(id) => {
        const org = orgs.find((o) => o.id === id) || null;
        onChange(org);
      }}
    >
      <SelectTrigger className="w-full md:w-64">
        <SelectValue placeholder="Sélectionner une organisation" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

