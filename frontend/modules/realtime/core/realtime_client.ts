import { eventBus } from './event_bus';
import { ReconnectManager } from './reconnect_manager';
import { RealtimeEvent, ConnectionStatus, ConnectionHealth } from '../types/realtime_types';

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectManager: ReconnectManager;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private health: ConnectionHealth = { status: 'disconnected', retryCount: 0 };

  constructor(wsUrl: string) {
    this.url = wsUrl;
    this.reconnectManager = new ReconnectManager(
      () => this.connect(),
      () => this.handleFailed(),
      (status) => this.updateStatus(status)
    );
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[Realtime] Connected');
        this.reconnectManager.reset();
        this.startHeartbeat();
        this.updateStatus('connected');
      };

      this.ws.onclose = () => {
        console.log('[Realtime] Disconnected');
        this.stopHeartbeat();
        this.reconnectManager.scheduleReconnect();
        this.updateStatus('disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('[Realtime] Error:', error);
        this.updateStatus('failed');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const realtimeEvent: RealtimeEvent = {
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
          };
          eventBus.emit(realtimeEvent);
        } catch (e) {
          console.error('[Realtime] Failed to parse message:', e);
        }
      };
    } catch (error) {
      console.error('[Realtime] Failed to create WebSocket:', error);
      this.reconnectManager.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.reconnectManager.cancel();
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('disconnected');
  }

  send(event: RealtimeEvent): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn('[Realtime] Cannot send, connection not open');
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        this.health = { ...this.health, lastPing: new Date().toISOString() };
      }
    }, 30000); // 30s heartbeat
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.health = { ...this.health, status, retryCount: this.reconnectManager.getRetryCount() };
    
    eventBus.emit({
      type: 'connection_status_changed',
      payload: this.health,
      timestamp: new Date().toISOString(),
      source: 'system',
    });
  }

  private handleFailed(): void {
    console.error('[Realtime] Connection failed after max retries');
    eventBus.emit({
      type: 'system_alert',
      payload: { message: 'Connection lost. Please refresh the page.' },
      timestamp: new Date().toISOString(),
      source: 'system',
    });
  }

  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getHealth(): ConnectionHealth {
    return this.health;
  }
}

// Singleton instance
let clientInstance: RealtimeClient | null = null;

export const getRealtimeClient = (wsUrl?: string): RealtimeClient => {
  if (!clientInstance) {
    const url = wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    clientInstance = new RealtimeClient(url);
  }
  return clientInstance;
};
