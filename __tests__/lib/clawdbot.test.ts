import { ClawdbotClient, ClawdbotConfig } from '@/lib/clawdbot';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: 'Normal closure' });
  }
}

// Replace global WebSocket
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
      expect(message.role).toBeDefined();
      expect(message.content).toBeDefined();
      done();
    });

    // Manually trigger a message
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
  });

  test('should disconnect properly', () => {
    client.connect();
    client.disconnect();
    expect((client as any).ws).toBeNull();
  });
});
