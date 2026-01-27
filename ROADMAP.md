# Roadmap

Product roadmap for Jarvis UI development.

## Version 0.1.0 ✅ (Current)
**Released: 2026-01-28**

- [x] Initial Next.js setup with TypeScript
- [x] WebSocket client for Clawdbot Gateway
- [x] Basic chat interface
- [x] Model selection dropdown
- [x] Dark theme
- [x] Connection status indicator
- [x] Project documentation

---

## Version 0.2.0 📋 (Next Release)
**Target: Early February 2026**

### Features
- [ ] **Message Streaming** - See responses as they're generated (word-by-word)
- [ ] **Markdown Rendering** - Support for code blocks, links, lists, bold/italic
- [ ] **Syntax Highlighting** - Code syntax highlighting in messages
- [ ] **Auto-reconnect** - Reconnect WebSocket on connection loss
- [ ] **Environment Variables** - Move token/URL to `.env.local`

### Improvements
- [ ] Better error handling (show error messages to user)
- [ ] Loading states (show spinner when waiting for response)
- [ ] Message timestamps (show send/receive time)
- [ ] Input validation (prevent empty messages)

### Documentation
- [ ] API documentation for ClawdbotClient
- [ ] Deployment guide (Vercel, Docker)
- [ ] Troubleshooting guide

---

## Version 0.3.0 🔮 (Future)
**Target: Mid February 2026**

### Features
- [ ] **Chat History Persistence** - Save chats to localStorage
- [ ] **Export Chat** - Download chat as .txt/.json/.md
- [ ] **Copy Message** - Click to copy assistant responses
- [ ] **Regenerate Response** - Retry last message with different model
- [ ] **System Prompts** - Add custom system instructions
- [ ] **Typing Indicators** - Show "Jarvis is typing..." animation

### UX Improvements
- [ ] Keyboard shortcuts (`Cmd+K` for model switch, etc.)
- [ ] Message reactions/feedback (👍👎)
- [ ] Scroll to top/bottom buttons
- [ ] Smooth scrolling animations
- [ ] Better mobile experience

---

## Version 0.4.0 🎨 (Later)
**Target: Late February 2026**

### Features
- [ ] **Settings Panel** - Customize theme, font size, etc.
- [ ] **Light/Dark Mode Toggle** - Switch between themes
- [ ] **Custom Themes** - Multiple color schemes
- [ ] **Font Options** - Choose different fonts
- [ ] **Message Density** - Compact/comfortable/spacious views

### Advanced Features
- [ ] **Multiple Sessions** - Sidebar with chat tabs
- [ ] **Search Messages** - Find old conversations
- [ ] **Starred Messages** - Bookmark important messages
- [ ] **Message Editing** - Edit sent messages
- [ ] **Voice Input** - Speech-to-text for messages

---

## Version 0.5.0 🚀 (Advanced)
**Target: March 2026**

### Power User Features
- [ ] **Agent Workflows** - Create custom multi-step workflows
- [ ] **Template Messages** - Save frequently used prompts
- [ ] **Batch Processing** - Process multiple inputs at once
- [ ] **File Uploads** - Send images/documents to chat
- [ ] **Code Execution** - Run code snippets directly in chat
- [ ] **Browser Integration** - Chrome extension for quick access

### Developer Features
- [ ] **API Playground** - Test Clawdbot Gateway APIs
- [ ] **Debug Mode** - View WebSocket messages
- [ ] **Performance Metrics** - Token usage, response times
- [ ] **Export to Code** - Generate code from conversations

---

## Version 1.0.0 🎉 (Stable Release)
**Target: Q2 2026**

### Production Ready
- [ ] Comprehensive test suite (unit, integration, E2E)
- [ ] Performance optimizations (virtual scrolling, caching)
- [ ] Accessibility improvements (WCAG 2.1 AA compliance)
- [ ] Mobile app (React Native?)
- [ ] Desktop app (Electron?)
- [ ] Multi-language support (i18n)
- [ ] Analytics (privacy-respecting)
- [ ] User onboarding flow
- [ ] Help documentation/tutorials

---

## Backlog (Ideas for Later)

### Nice to Have
- Collaborative chat (multiple users)
- Chat sharing (public links)
- AI-generated summaries of long chats
- Integration with other tools (Notion, Obsidian, etc.)
- Voice output (TTS for responses)
- Custom avatars for models
- Dark/light mode auto-switch based on time
- Distraction-free mode (fullscreen chat)
- Chat analytics (most used models, token usage)
- Prompt library (community-shared prompts)

### Technical Improvements
- Migrate to Zustand for state management
- Add React Query for server state
- Implement IndexedDB for persistence
- WebWorker for heavy processing
- Service Worker for offline support
- GraphQL API layer (optional)
- Real-time collaboration (CRDT)

---

## Community Requests

Have an idea? Open an issue on GitHub!

**How to request a feature:**
1. Check if it's already in the roadmap
2. Open a new issue with `[Feature Request]` prefix
3. Describe the use case and benefits
4. We'll discuss and prioritize

---

## Versioning Strategy

- **0.x.x** - Pre-release, breaking changes allowed
- **1.0.0** - First stable release
- **1.x.x** - Backward-compatible features
- **2.0.0** - Major redesign or breaking changes

## Release Cycle

- **Patch** (0.0.x) - Weekly (bug fixes)
- **Minor** (0.x.0) - Bi-weekly (new features)
- **Major** (x.0.0) - As needed (breaking changes)

---

**Last Updated:** 2026-01-28  
**Next Review:** 2026-02-15
