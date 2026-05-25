import { Client } from '@stomp/stompjs';

// Centralized WebSocket service for connecting and subscribing
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = [];
  }

  connect() {
    if (this.client) {
      return;
    }

    const token = localStorage.getItem('token');
    let defaultWsUrl = `ws://localhost:8081/ws${token ? '?token=' + token : ''}`;
    if (import.meta.env.VITE_API_URL) {
      try {
        const apiUrl = new URL(import.meta.env.VITE_API_URL);
        const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        defaultWsUrl = `${protocol}//${apiUrl.host}/ws${token ? '?token=' + token : ''}`;
      } catch (e) {
        console.error('Invalid VITE_API_URL for WebSocket', e);
      }
    }
    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.connected = true;

        // Resubscribe all active subscriptions
        this.subscribers.forEach(({ destination, callback }) => {
          this.client.subscribe(destination, (message) => {
            if (message.body) {
              callback(JSON.parse(message.body));
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket connection error', event);
      }
    });

    this.client.activate();
  }

  subscribe(destination, callback) {
    this.subscribers.push({ destination, callback });

    if (this.connected && this.client) {
      return this.client.subscribe(destination, (message) => {
        if (message.body) {
          callback(JSON.parse(message.body));
        }
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscribers = [];
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
