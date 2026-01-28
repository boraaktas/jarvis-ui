import { ClawdbotClient, ClawdbotConfig } from '@/lib/clawdbot';

// Mock WebSocket event types
interface MockMessageEvent {
  data: string;
}

interface MockCloseEvent {
  code: number;
  reason: string;
}

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MockMessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: MockCloseEvent) => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  send(_data: string) {
    // Mock send - parameter intentionally unused
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: 'Normal closure' });
  }
}

// Replace global WebSocket
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.WebSocket = MockWebSocket as any;

describe('ClawdbotClient', () => {
  let client: ClawdbotClient;
  const config: ClawdbotConfig = {
    gatewayUrl: 'ws://localhost:18789',
    token: 'test-token'
  };

  beforeEach(() => {
    client = new ClawdbotClient(config);
  });

  afterEach(() => {
    client.disconnect();
  });

  test('should create client with config', () => {
    expect(client).toBeDefined();
  });

  test('should connect to gateway', (done) => {
    client.onStatus((status) => {
      if (status === 'connecting') {
        expect(status).toBe('connecting');
        done();
      }
    });
    
    client.connect();
  });

  test('should handle message callbacks', (done) => {
    client.onMessage((message) => {
      expect(message).toBeDefined();
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Test message');
      done();
    });

    client.connect();

    // Wait for connection, then manually trigger a message
    setTimeout(() => {
      // Access private ws property for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ws = (client as any).ws;
      if (ws && ws.onmessage) {
        ws.onmessage({
          data: JSON.stringify({
            type: 'event',
            event: 'chat',
            payload: {
              message: {
                role: 'assistant',
                content: 'Test message'
              }
            }
          })
        });
      }
    }, 10);
  });

  test('should disconnect properly', () => {
    client.connect();
    client.disconnect();
    // Access private ws property for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((client as any).ws).toBeNull();
  });
});
