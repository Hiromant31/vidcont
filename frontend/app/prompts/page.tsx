'use client';

import { useQuery } from '@tanstack/react-query';
import { promptsApi } from '@/services/api/settings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PromptsPage() {
  const { data: prompts = [], isLoading, error } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => promptsApi.getAll(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading prompts</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prompts</h1>
        <Button>Create Prompt</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No prompts yet</p>
            </CardContent>
          </Card>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.template_id}>
              <CardHeader>
                <CardTitle className="text-lg">{prompt.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Stage: {prompt.stage}
                </p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {prompt.content}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
