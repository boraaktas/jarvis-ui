'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ClawdbotClient, Message } from '@/lib/clawdbot';

/**
 * Available AI models for selection
 * 
 * TODO: Move this to a config file or fetch from gateway
 */
const MODELS = [
  { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Best)' },
  { value: 'openai/gpt-4.1', label: 'GPT-4.1 (Excellent)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
  { value: 'openrouter/google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)' },
];

/**
 * Main chat interface component
 * 
 * Features:
 * - Real-time chat with Clawdbot via WebSocket
 * - Model selection dropdown
 * - Connection status indicator
 * - Auto-scrolling message area
 * - Enter to send, Shift+Enter for newline
 */
export default function Home() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [client, setClient] = useState<ClawdbotClient | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Clawdbot client on mount
  useEffect(() => {
    // Initialize Clawdbot client
    // TODO: Move these to environment variables (.env.local)
    const clawdbot = new ClawdbotClient({
      gatewayUrl: 'ws://127.0.0.1:18789',
      token: 'e8567391485f6a532c333d0e774dd37971569f13acbdb093'
    });

    clawdbot.onMessage((message) => {
      setMessages(prev => [...prev, message]);
      // Stop generating indicator when assistant responds
      if (message.role === 'assistant') {
        setIsGenerating(false);
        setStreamingContent(''); // Clear streaming content
      }
    });

    clawdbot.onStream((content) => {
      // Append streaming content
      setStreamingContent(prev => prev + content);
      if (!isGenerating) {
        setIsGenerating(true);
      }
    });

    clawdbot.onStatus((newStatus) => {
      setStatus(newStatus);
    });

    clawdbot.connect();
    setClient(clawdbot);

    return () => {
      clawdbot.disconnect();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !client) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    client.sendMessage(input, selectedModel);
    setInput('');
    setStreamingContent('');
    setIsGenerating(true);
  };

  const handleStop = () => {
    if (!client) return;
    client.abortMessage();
    setIsGenerating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-background flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Jarvis UI</h1>
          <p className="text-sm text-muted-foreground">Custom Clawdbot Interface</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <Card
                key={index}
                className={`p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                    : 'bg-muted max-w-[80%]'
                }`}
              >
                <div className="text-xs font-semibold mb-1 opacity-70">
                  {message.role === 'user' ? 'You' : 'Jarvis'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </Card>
            ))}
            
            {/* Streaming Message or Typing Indicator */}
            {isGenerating && (
              <Card className="p-4 bg-muted max-w-[80%]">
                <div className="text-xs font-semibold mb-1 opacity-70">Jarvis</div>
                {streamingContent ? (
                  <div className="whitespace-pre-wrap">{streamingContent}</div>
                ) : (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </Card>
            )}
            
            {/* Connection Error */}
            {status === 'disconnected' && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">
                  <h2 className="text-2xl font-bold mb-2">⚠️ Connection Failed</h2>
                  <p className="text-sm mb-4">Cannot connect to Clawdbot Gateway</p>
                </div>
                <div className="text-muted-foreground text-sm space-y-2 max-w-md mx-auto">
                  <p>Make sure Clawdbot Gateway is running:</p>
                  <code className="block bg-muted p-2 rounded">clawdbot gateway status</code>
                  <p className="pt-4">Gateway should be listening on:</p>
                  <code className="block bg-muted p-2 rounded">ws://127.0.0.1:18789</code>
                  <p className="pt-4 text-xs">Check browser console (F12) for details</p>
                </div>
                <Button 
                  onClick={() => client?.connect()} 
                  className="mt-6"
                  variant="outline"
                >
                  Retry Connection
                </Button>
              </div>
            )}
            
            {messages.length === 0 && !isGenerating && status === 'connected' && (
              <div className="text-center text-muted-foreground py-12">
                <h2 className="text-2xl font-bold mb-2">Welcome to Jarvis UI</h2>
                <p>Start chatting with your AI assistant</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            {/* Model Selection Bar */}
            <div className="flex items-center gap-3 mb-3">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2 ml-auto">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'connected' ? 'bg-green-500' :
                  status === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-muted-foreground capitalize">{status}</span>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={status !== 'connected' || isGenerating}
                className="flex-1"
              />
              {isGenerating ? (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                >
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={status !== 'connected' || !input.trim()}
                >
                  Send
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
