/**
 * Represents a chat message in the conversation
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;  // True if message is still being generated
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
  private streamHandlers: ((content: string) => void)[] = [];
  private statusHandlers: ((status: 'connecting' | 'connected' | 'disconnected') => void)[] = [];
  private requestId = 0;

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
    console.log('Connecting to:', url);
    
    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.error('WebSocket creation failed:', error);
      this.notifyStatus('disconnected');
      return;
    }

    this.ws.onopen = () => {
      console.log('🔌 WebSocket opened, waiting for challenge...');
      // Don't set status to connected yet - wait for connect.challenge
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', data);
        
        // Handle connect.challenge - respond with connect request
        if (data.type === 'event' && data.event === 'connect.challenge') {
          console.log('🔐 Received challenge, sending connect request...');
          this.send({
            type: 'req',
            id: `${++this.requestId}`,
            method: 'connect',
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: 'jarvis-ui',
                version: '0.1.1',
                platform: 'web',
                mode: 'operator'
              },
              role: 'operator',
              scopes: ['operator.read', 'operator.write'],
              auth: {
                token: this.config.token
              },
              locale: 'en-US',
              userAgent: 'jarvis-ui/0.1.1'
            }
          });
          return;
        }
        
        // Handle connect response
        if (data.type === 'res' && data.payload?.type === 'hello-ok') {
          console.log('✅ Connected successfully!');
          this.notifyStatus('connected');
          
          // Request chat history
          console.log('📜 Requesting chat history...');
          this.send({
            type: 'req',
            id: `${++this.requestId}`,
            method: 'chat.history',
            params: { 
              sessionKey: 'jarvis-ui',
              limit: 50 
            }
          });
          return;
        }
        
        // Handle chat.history response
        if (data.type === 'res' && data.payload?.messages) {
          console.log('📜 Loading chat history:', data.payload.messages.length, 'messages');
          data.payload.messages.forEach((msg: any) => {
            this.notifyMessage({
              role: msg.role,
              content: msg.content || '',
              timestamp: Date.now(),
              isStreaming: false
            });
          });
          return;
        }
        
        // Handle chat events (incoming messages)
        if (data.type === 'event' && data.event === 'chat') {
          const msg = data.payload?.message;
          if (!msg) return;
          
          const content = msg.content || '';
          const isStreaming = data.payload.streaming === true;
          
          if (isStreaming) {
            // Streaming chunk - notify stream handlers
            console.log('📝 Streaming:', content.substring(0, 50) + '...');
            this.notifyStream(content);
          } else {
            // Complete message - notify message handlers
            console.log('✉️ Complete message:', content.substring(0, 50) + '...');
            this.notifyMessage({
              role: msg.role,
              content,
              timestamp: Date.now(),
              isStreaming: false
            });
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing message:', error, event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log('❌ Disconnected from Clawdbot Gateway');
      console.log('Close code:', event.code, 'Reason:', event.reason);
      this.notifyStatus('disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      console.error('Gateway URL:', this.config.gatewayUrl);
      console.error('Make sure Clawdbot Gateway is running on ws://127.0.0.1:18789');
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
      type: 'req',
      id: `${++this.requestId}`,
      method: 'chat.send',
      params
    });
  }

  /**
   * Abort the current message generation
   * Stops the AI from continuing its response
   */
  abortMessage() {
    this.send({
      type: 'req',
      id: `${++this.requestId}`,
      method: 'chat.abort',
      params: {
        sessionKey: 'jarvis-ui'
      }
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
   * Register a handler for streaming content chunks
   * 
   * @param handler - Callback function called when streaming content arrives
   */
  onStream(handler: (content: string) => void) {
    this.streamHandlers.push(handler);
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

  private notifyStream(content: string) {
    this.streamHandlers.forEach(handler => handler(content));
  }

  private notifyStatus(status: 'connecting' | 'connected' | 'disconnected') {
    this.statusHandlers.forEach(handler => handler(status));
  }
}
