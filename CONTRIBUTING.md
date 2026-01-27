# Contributing to Jarvis UI

## Development Setup

### Prerequisites
- Node.js 18+
- npm
- Clawdbot Gateway running locally

### First Time Setup

1. Clone the repository:
```bash
git clone https://github.com/boraaktas/jarvis-ui.git
cd jarvis-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Project Structure

```
jarvis-ui/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main chat interface
│   ├── layout.tsx         # Root layout & metadata
│   └── globals.css        # Global styles & CSS variables
├── components/
│   └── ui/                # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       └── select.tsx
├── lib/
│   ├── clawdbot.ts        # WebSocket client for Clawdbot Gateway
│   └── utils.ts           # Utility functions (cn, etc.)
├── public/                # Static assets
└── docs/                  # Additional documentation
```

## Code Style

### TypeScript
- Use TypeScript for all new files
- Prefer interfaces over types for object shapes
- Use proper typing, avoid `any`

### React
- Use functional components with hooks
- Prefer `const` over `let` when possible
- Use descriptive component and variable names

### Naming Conventions
- **Components**: PascalCase (e.g., `ChatMessage.tsx`)
- **Files**: kebab-case for utilities (e.g., `websocket-client.ts`)
- **Variables**: camelCase (e.g., `selectedModel`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_MODELS`)

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(chat): add markdown rendering for messages
fix(websocket): reconnect on connection loss
docs(readme): update installation instructions
refactor(clawdbot): extract message handling to separate hook
```

## Git Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `docs/<name>` - Documentation updates

### Creating a Feature

1. Create a new branch from `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/markdown-support
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat(chat): add markdown rendering for messages

- Added react-markdown dependency
- Created MessageContent component
- Styled code blocks with syntax highlighting
- Added support for links and lists"
```

3. Push and create PR:
```bash
git push -u origin feature/markdown-support
```

## Adding New Features

### Before Starting
1. Check existing issues/roadmap
2. Create an issue describing the feature
3. Discuss approach if significant change

### Development Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript types are proper
- [ ] Component is responsive
- [ ] Dark mode looks good
- [ ] Tested in browser
- [ ] Documentation updated
- [ ] Commit messages follow convention

## Adding UI Components

We use Shadcn/ui for components. To add a new one:

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add dropdown-menu
```

## Testing Locally

### Quick Test
```bash
npm run dev
```
Open http://localhost:3000 and test the feature.

### Build Test
```bash
npm run build
npm start
```

### Type Check
```bash
npx tsc --noEmit
```

### Lint
```bash
npm run lint
```

## Common Tasks

### Adding a New Model

Edit `app/page.tsx`:
```typescript
const MODELS = [
  { value: 'provider/model-name', label: 'Display Name' },
  // Add new model here
];
```

### Changing Gateway URL

Edit `app/page.tsx`:
```typescript
const clawdbot = new ClawdbotClient({
  gatewayUrl: 'ws://your-gateway-url:port',
  token: 'your-token'
});
```

### Modifying Theme Colors

Edit `app/globals.css` and update CSS variables:
```css
:root {
  --background: ...;
  --foreground: ...;
}
```

## Need Help?

- Check existing issues
- Review documentation in `/docs`
- Ask in discussions

## License

MIT - See LICENSE file
