# Architecture Documentation

## Overview

Jarvis UI is a Next.js-based web application that provides a modern chat interface for Clawdbot. It communicates with the Clawdbot Gateway via WebSocket for real-time messaging.

## Tech Stack

### Frontend Framework
- **Next.js 14** (App Router)
  - Server-side rendering (SSR)
  - React 19
  - Turbopack for fast development
  
### Language
- **TypeScript 5**
  - Strict mode enabled
  - Type-safe WebSocket client
  - Interface-driven design

### Styling
- **Tailwind CSS 4**
  - Utility-first CSS framework
  - Custom design tokens via CSS variables
  - Dark mode by default

### UI Components
- **Shadcn/ui**
  - Accessible component library
  - Built on Radix UI primitives
  - Customizable with Tailwind

### Build Tools
- **Turbopack** (Next.js bundler)
- **PostCSS** for CSS processing
- **ESLint** for code quality

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Next.js App (React)                    │ │
│  │                                                      │ │
│  │  ┌──────────────┐    ┌──────────────┐             │ │
│  │  │   page.tsx   │    │ UI Components │             │ │
│  │  │  (Chat UI)   │◄───┤ (Shadcn/ui)  │             │ │
│  │  └──────┬───────┘    └──────────────┘             │ │
│  │         │                                           │ │
│  │         ▼                                           │ │
│  │  ┌──────────────────────────────┐                  │ │
│  │  │   ClawdbotClient             │                  │ │
│  │  │   (lib/clawdbot.ts)          │                  │ │
│  │  │                              │                  │ │
│  │  │  - WebSocket connection      │                  │ │
│  │  │  - Message handling          │                  │ │
│  │  │  - Event emitters            │                  │ │
│  │  └──────────────┬───────────────┘                  │ │
│  │                 │                                   │ │
│  └─────────────────┼───────────────────────────────────┘ │
│                    │ WebSocket (ws://)                   │
└────────────────────┼───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Clawdbot Gateway                         │
│                 (WebSocket Server)                       │
│                                                          │
│  Port: 18789                                             │
│  Protocol: WebSocket                                     │
│  Auth: Token-based                                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  RPC Methods:                                       │ │
│  │  - connect (auth)                                   │ │
│  │  - chat.send (send message)                         │ │
│  │  - chat.history (fetch messages)                    │ │
│  │  - chat (receive messages)                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Page Component (`app/page.tsx`)

**Responsibilities:**
- Main chat interface
- State management (messages, model, status)
- User input handling
- Message display
- Model selection

**State:**
```typescript
- messages: Message[]        // Chat history
- input: string             // Current input text
- selectedModel: string     // Active AI model
- status: ConnectionStatus  // WebSocket status
- client: ClawdbotClient    // WebSocket client instance
```

**Effects:**
- Initialize WebSocket client on mount
- Auto-scroll messages on new message
- Cleanup connection on unmount

### 2. Clawdbot Client (`lib/clawdbot.ts`)

**Purpose:** WebSocket abstraction layer

**Key Features:**
- Connection management
- Message serialization/deserialization
- Event-based architecture (observers)
- Type-safe message handling

**Public API:**
```typescript
class ClawdbotClient {
  constructor(config: ClawdbotConfig)
  connect(): void
  disconnect(): void
  sendMessage(content: string, model?: string): void
  onMessage(handler: (message: Message) => void): void
  onStatus(handler: (status: Status) => void): void
}
```

**Internal Methods:**
```typescript
private send(data: any): void           // Send to WebSocket
private notifyMessage(msg: Message): void  // Notify observers
private notifyStatus(status: Status): void // Notify observers
```

### 3. UI Components (`components/ui/`)

**Shadcn/ui Components Used:**
- `Button` - Send button
- `Input` - Message input field
- `ScrollArea` - Scrollable message container
- `Select` - Model dropdown
- `Card` - Message bubbles

**Component Properties:**
- All components are server-compatible
- Styled with Tailwind utility classes
- Accessible (ARIA attributes)
- Dark mode support via CSS variables

## Data Flow

### Sending a Message

```
User types message
    ↓
User presses Enter / clicks Send
    ↓
handleSend() called
    ↓
Add message to local state (optimistic update)
    ↓
client.sendMessage(text, model)
    ↓
ClawdbotClient.sendMessage()
    ↓
WebSocket.send(JSON-RPC message)
    ↓
Clawdbot Gateway receives message
    ↓
Gateway processes with selected model
    ↓
Gateway sends response via WebSocket
    ↓
ClawdbotClient.onmessage event
    ↓
notifyMessage() → observers notified
    ↓
React state updated
    ↓
UI re-renders with new message
```

### Connection Flow

```
Component mounts
    ↓
new ClawdbotClient(config)
    ↓
client.connect()
    ↓
WebSocket connection opened
    ↓
onopen → send auth token
    ↓
Request chat history
    ↓
notifyStatus('connected')
    ↓
UI shows green indicator
```

## WebSocket Protocol

### Message Format (JSON-RPC)

**Request:**
```json
{
  "method": "chat.send",
  "params": {
    "message": "Hello",
    "sessionKey": "jarvis-ui",
    "model": "anthropic/claude-sonnet-4-5",
    "idempotencyKey": "1706396820123-0.123"
  }
}
```

**Response:**
```json
{
  "method": "chat",
  "params": {
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help?"
    }
  }
}
```

### Methods Used

| Method | Direction | Purpose |
|--------|-----------|---------|
| `connect` | Client → Server | Authenticate with token |
| `chat.send` | Client → Server | Send user message |
| `chat.history` | Client → Server | Fetch previous messages |
| `chat` | Server → Client | Receive assistant message |

## State Management

Currently using **React local state** (`useState`, `useEffect`).

### Future Considerations
- **Zustand** for global state (if app grows)
- **React Query** for server state caching
- **IndexedDB** for persistent chat history

## Styling System

### CSS Variables (Design Tokens)

Located in `app/globals.css`:

```css
:root {
  --background: ...      /* Page background */
  --foreground: ...      /* Text color */
  --primary: ...         /* User messages */
  --muted: ...           /* Assistant messages */
  /* ... more variables */
}
```

### Tailwind Configuration

- Custom colors mapped to CSS variables
- Dark mode enabled via `class` strategy
- Responsive breakpoints (sm, md, lg, xl)

## Performance Considerations

### Current Optimizations
1. **Turbopack** for fast dev builds
2. **Auto-scroll** only on new messages
3. **Optimistic updates** (user messages appear instantly)
4. **Component re-use** (Shadcn components)

### Future Optimizations
- Virtual scrolling for long chats (react-window)
- Message pagination
- Lazy-load images/attachments
- WebSocket reconnection with exponential backoff

## Security

### Current Measures
1. **Token-based auth** for WebSocket
2. **No credentials in code** (should be env vars)
3. **TypeScript** for type safety
4. **ESLint** to catch issues

### Improvements Needed
- [ ] Move token to environment variable
- [ ] Add input sanitization
- [ ] Implement CSP headers
- [ ] Add rate limiting on client side

## Deployment

### Development
```bash
npm run dev
```
Runs on http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Docker** (custom)
- **Static export** (`next export`) for simple hosting

## Configuration

### Environment Variables (Planned)

Create `.env.local`:
```bash
NEXT_PUBLIC_GATEWAY_URL=ws://127.0.0.1:18789
NEXT_PUBLIC_GATEWAY_TOKEN=your-token-here
```

Update `app/page.tsx`:
```typescript
const clawdbot = new ClawdbotClient({
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL!,
  token: process.env.NEXT_PUBLIC_GATEWAY_TOKEN
});
```

## Testing Strategy (Future)

### Unit Tests
- `lib/clawdbot.ts` - WebSocket client logic
- Utility functions in `lib/utils.ts`

### Integration Tests
- Message send/receive flow
- Model selection changes
- Connection/reconnection logic

### E2E Tests
- Full user flow (connect → send → receive)
- Browser compatibility

**Tools:**
- **Jest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for E2E

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

1. **No reconnection logic** - Manual refresh needed if connection drops
2. **No message persistence** - Lost on page reload
3. **Single session only** - No multiple chat tabs
4. **No typing indicators** - Can't see when AI is typing
5. **No message editing** - Can't edit sent messages

See ROADMAP.md for planned improvements.
