export type EventSource = 'pipeline' | 'jobs' | 'scenes' | 'characters' | 'system';

export type EventType = 
  | 'connection_status_changed'
  | 'pipeline_updated'
  | 'job_progress'
  | 'job_completed'
  | 'job_failed'
  | 'scene_updated'
  | 'scene_generated'
  | 'character_updated'
  | 'queue_updated'
  | 'log_stream'
  | 'system_alert';

export interface RealtimeEvent<T = any> {
  type: EventType;
  payload: T;
  timestamp: string;
  source: EventSource;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'failed';

export interface ConnectionHealth {
  status: ConnectionStatus;
  latencyMs?: number;
  lastPing?: string;
  retryCount: number;
}
