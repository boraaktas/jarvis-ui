# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Message streaming support
- Markdown rendering with code syntax highlighting
- Chat history persistence (localStorage)
- Settings panel (theme, font size, etc.)
- Multiple chat sessions/tabs
- Export chat to file
- Keyboard shortcuts
- Voice input support

## [0.1.0] - 2026-01-28

### Added
- Initial project setup with Next.js 14, TypeScript, and Tailwind CSS
- Shadcn/ui component library integration
- WebSocket client for Clawdbot Gateway (`lib/clawdbot.ts`)
- Real-time chat interface with message display
- Model selection dropdown with 4 models:
  - Claude Sonnet 4.5 (Anthropic)
  - GPT-4.1 (OpenAI)
  - GPT-4o Mini (OpenAI)
  - Gemini 2.0 Flash Free (Google/OpenRouter)
- Connection status indicator (connecting/connected/disconnected)
- Dark theme by default
- Responsive layout with sidebar
- Message auto-scroll to bottom
- Enter to send, Shift+Enter for new line
- Project documentation:
  - README.md with setup instructions
  - CONTRIBUTING.md with development guidelines
  - CHANGELOG.md (this file)
  - ARCHITECTURE.md for technical details
  - ROADMAP.md for future plans

### Technical Details
- WebSocket connection to Clawdbot Gateway (ws://127.0.0.1:18789)
- Token-based authentication
- Session-based message handling
- TypeScript strict mode
- ESLint configuration

---

## Version Format

- **Major** (X.0.0): Breaking changes, major redesign
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, minor improvements

## Categories

- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
