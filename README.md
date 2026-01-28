# Jarvis UI

A modern, custom chat interface for Clawdbot with advanced model selection.

## Features

- 🎨 **Modern UI** - Built with Next.js 14, TypeScript, and Tailwind CSS
- 🎯 **Model Selection** - Easy dropdown to switch between AI models (Claude, GPT-4, Gemini)
- ⚡ **Real-time** - WebSocket connection to Clawdbot Gateway
- 🌙 **Dark Mode** - Beautiful dark theme by default
- 📱 **Responsive** - Works on desktop and mobile
- ⏸️ **Stop Generation** - Abort AI responses mid-stream
- 📝 **Streaming** - See responses appear word-by-word
- 📤 **Export Chat** - Download conversations as JSON
- 🗑️ **Clear Chat** - Reset conversations with confirmation
- 📊 **Sidebar Menu** - Session info, settings, and actions
- ✅ **Tested** - Jest + React Testing Library
- 🔄 **CI/CD** - Automated testing with GitHub Actions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Backend**: Clawdbot Gateway (WebSocket)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Clawdbot Gateway running on `ws://127.0.0.1:18789`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Configuration

Edit `app/page.tsx` to configure:

- **Gateway URL**: Change WebSocket URL if your gateway runs elsewhere
- **Auth Token**: Update the token for authentication
- **Models**: Add or remove models from the dropdown

## Model Options

Currently supports:
- Claude Sonnet 4.5 (Best quality, Anthropic)
- GPT-4.1 (Excellent quality, OpenAI)
- GPT-4o Mini (Fast and cheap, OpenAI)
- Gemini 2.0 Flash (Free, Google via OpenRouter)

## Project Structure

```
jarvis-ui/
├── app/
│   ├── page.tsx          # Main chat interface
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Shadcn/ui components
├── lib/
│   ├── clawdbot.ts       # Clawdbot WebSocket client
│   └── utils.ts          # Utilities
└── README.md
```

## Contributing

This is a personal project, but feel free to fork and customize!

## License

MIT
