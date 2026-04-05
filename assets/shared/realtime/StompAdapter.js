import { Client } from '@stomp/stompjs';
import SockJs from 'sockjs-client';
import { normalizePayload } from './utils';

export class StompAdapter {
  constructor({ url, onConnectionChange, onError }) {
    this.url = url;
    this.onConnectionChange = onConnectionChange;
    this.onError = onError;
    this.client = null;
    this.connected = false;
  }

  connect() {
    if (this.client) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJs(this.url, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 10000,
          headers: {
            Origin: 'http://localhost:8081',
          },
        }),
      onConnect: () => {
        this.connected = true;
        this.onConnectionChange?.(true);
      },
      onDisconnect: () => {
        this.connected = false;
        this.onConnectionChange?.(false);
      },
      onStompError: (error) => {
        this.onError?.(error);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client = client;
    this.client.activate();
  }

  disconnect() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
    }
    this.connected = false;
    this.client = null;
    this.onConnectionChange?.(false);
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) return null;
    return this.client.subscribe(topic, (message) => {
      const normalized = normalizePayload(message?.body);
      callback?.(normalized);
    });
  }

  send(destination, body) {
    if (!this.client || !this.client.connected) return false;
    this.client.publish({
      destination,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    return true;
  }
}

