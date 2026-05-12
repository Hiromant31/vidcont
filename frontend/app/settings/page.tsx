'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/services/api/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading settings</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Provider</label>
            <p className="text-muted-foreground">{settings?.ai_provider}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Model</label>
            <p className="text-muted-foreground">{settings?.model}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Default Quality</label>
            <p className="text-muted-foreground">{settings?.default_quality}p</p>
          </div>
          <div>
            <label className="text-sm font-medium">Auto Continue Pipeline</label>
            <p className="text-muted-foreground">
              {settings?.auto_continue_pipeline ? 'Yes' : 'No'}
            </p>
          </div>
          <Button onClick={() => updateMutation.mutate({ auto_continue_pipeline: !settings?.auto_continue_pipeline })}>
            Toggle Auto Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
