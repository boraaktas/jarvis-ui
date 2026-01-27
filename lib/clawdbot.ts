export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ClawdbotConfig {
  gatewayUrl: string;
  token?: string;
}

export class ClawdbotClient {
  private ws: WebSocket | null = null;
  private config: ClawdbotConfig;
  private messageHandlers: ((message: Message) => void)[] = [];
  private statusHandlers: ((status: 'connecting' | 'connected' | 'disconnected') => void)[] = [];

  constructor(config: ClawdbotConfig) {
    this.config = config;
  }

  connect() {
    this.notifyStatus('connecting');
    
    const url = this.config.gatewayUrl;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to Clawdbot Gateway');
      this.notifyStatus('connected');
      
      // Authenticate if token is provided
      if (this.config.token) {
        this.send({
          method: 'connect',
          params: {
            auth: {
              token: this.config.token
            }
          }
        });
      }
      
      // Request chat history
      this.send({
        method: 'chat.history',
        params: { limit: 50 }
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
        
        if (data.method === 'chat' && data.params?.message) {
          const msg = data.params.message;
          this.notifyMessage({
            role: msg.role,
            content: msg.content || '',
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from Clawdbot Gateway');
      this.notifyStatus('disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyStatus('disconnected');
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content: string, model?: string) {
    const params: any = {
      message: content,
      sessionKey: 'jarvis-ui',
      idempotencyKey: `${Date.now()}-${Math.random()}`
    };
    
    if (model) {
      params.model = model;
    }

    this.send({
      method: 'chat.send',
      params
    });
  }

  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  onStatus(handler: (status: 'connecting' | 'connected' | 'disconnected') => void) {
    this.statusHandlers.push(handler);
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private notifyMessage(message: Message) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyStatus(status: 'connecting' | 'connected' | 'disconnected') {
    this.statusHandlers.forEach(handler => handler(status));
  }
}
