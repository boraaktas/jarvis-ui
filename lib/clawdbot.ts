/**
 * Represents a chat message in the conversation
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * Configuration options for ClawdbotClient
 */
export interface ClawdbotConfig {
  gatewayUrl: string;  // WebSocket URL (e.g., ws://127.0.0.1:18789)
  token?: string;      // Optional auth token for gateway
}

/**
 * WebSocket client for Clawdbot Gateway
 * 
 * Handles connection, authentication, and message routing
 * between the UI and Clawdbot Gateway.
 * 
 * @example
 * ```typescript
 * const client = new ClawdbotClient({
 *   gatewayUrl: 'ws://127.0.0.1:18789',
 *   token: 'your-token'
 * });
 * 
 * client.onMessage((msg) => console.log(msg));
 * client.connect();
 * client.sendMessage('Hello!', 'anthropic/claude-sonnet-4-5');
 * ```
 */
export class ClawdbotClient {
  private ws: WebSocket | null = null;
  private config: ClawdbotConfig;
  private messageHandlers: ((message: Message) => void)[] = [];
  private statusHandlers: ((status: 'connecting' | 'connected' | 'disconnected') => void)[] = [];

  constructor(config: ClawdbotConfig) {
    this.config = config;
  }

  /**
   * Establish WebSocket connection to Clawdbot Gateway
   * 
   * Automatically authenticates if token is provided,
   * and requests recent chat history.
   */
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

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message to Clawdbot
   * 
   * @param content - The message text
   * @param model - Optional model override (e.g., 'anthropic/claude-sonnet-4-5')
   */
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

  /**
   * Register a handler for incoming messages
   * 
   * @param handler - Callback function called when a message is received
   */
  onMessage(handler: (message: Message) => void) {
    this.messageHandlers.push(handler);
  }

  /**
   * Register a handler for connection status changes
   * 
   * @param handler - Callback function called when connection status changes
   */
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
