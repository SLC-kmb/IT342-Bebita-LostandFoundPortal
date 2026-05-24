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

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
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
