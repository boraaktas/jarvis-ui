# Deployment Guide

How to deploy Jarvis UI to production.

## Prerequisites

- Node.js 18+ installed
- Clawdbot Gateway accessible (same machine or remote)
- GitHub account (for repo)

---

## Option 1: Vercel (Recommended for Next.js)

Vercel is the creators of Next.js and offers seamless deployment.

### Steps

1. **Push code to GitHub** (already done ✅)

2. **Sign up for Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

3. **Import Repository**
   - Click "New Project"
   - Import `boraaktas/jarvis-ui`
   - Vercel auto-detects Next.js

4. **Configure Environment Variables**
   - Add in Vercel dashboard:
     ```
     NEXT_PUBLIC_GATEWAY_URL=ws://your-gateway-url:18789
     NEXT_PUBLIC_GATEWAY_TOKEN=your-token
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Get a URL like `jarvis-ui.vercel.app`

### Auto-Deploy
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests

---

## Option 2: Local Production Build

Run optimized build on your Mac.

### Steps

1. **Build the app**
   ```bash
   cd ~/Desktop/jarvis/jarvis-ui
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **Access**
   - Open http://localhost:3000
   - Or http://[your-local-ip]:3000 from other devices

### Run on Startup (macOS)

Create a launch agent to auto-start:

1. **Create startup script**
   ```bash
   mkdir -p ~/scripts
   nano ~/scripts/start-jarvis-ui.sh
   ```

   Add:
   ```bash
   #!/bin/bash
   cd ~/Desktop/jarvis/jarvis-ui
   npm start
   ```

   Make executable:
   ```bash
   chmod +x ~/scripts/start-jarvis-ui.sh
   ```

2. **Create LaunchAgent**
   ```bash
   nano ~/Library/LaunchAgents/com.jarvis.ui.plist
   ```

   Add:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.jarvis.ui</string>
       <key>ProgramArguments</key>
       <array>
           <string>/Users/bora/scripts/start-jarvis-ui.sh</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
   </dict>
   </plist>
   ```

3. **Load the agent**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.jarvis.ui.plist
   ```

---

## Option 3: Docker

Containerize the app for easy deployment.

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t jarvis-ui .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_GATEWAY_URL=ws://host.docker.internal:18789 \
  -e NEXT_PUBLIC_GATEWAY_TOKEN=your-token \
  jarvis-ui
```

---

## Option 4: Netlify

Alternative to Vercel.

### Steps

1. **Sign up** at https://netlify.com
2. **Connect GitHub repo**
3. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Add environment variables** in Netlify dashboard
5. **Deploy**

---

## Remote Gateway Access

If Clawdbot Gateway is on a different machine:

### Option A: Tailscale (Recommended)

1. Install Tailscale on both machines
2. Use Tailscale IP in `NEXT_PUBLIC_GATEWAY_URL`:
   ```
   ws://100.x.x.x:18789
   ```

### Option B: SSH Tunnel

Forward gateway port to local machine:

```bash
ssh -L 18789:localhost:18789 user@gateway-host
```

Then use `ws://127.0.0.1:18789` in UI.

### Option C: ngrok

Expose gateway publicly (temporary):

```bash
# On gateway machine
ngrok tcp 18789
```

Use the ngrok URL in UI (e.g., `ws://0.tcp.ngrok.io:12345`).

⚠️ **Security Warning**: Only use ngrok for testing. Use proper auth.

---

## Production Checklist

Before going live:

- [ ] Move gateway URL/token to environment variables
- [ ] Enable HTTPS (if using custom domain)
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Add analytics (if desired, privacy-respecting)
- [ ] Test on multiple devices/browsers
- [ ] Set up automatic backups (if storing data)
- [ ] Configure CORS on gateway (if needed)
- [ ] Add rate limiting
- [ ] Review security settings
- [ ] Set up CI/CD pipeline
- [ ] Document rollback procedure

---

## Monitoring

### Vercel Analytics

Free analytics included with Vercel:
- Page views
- Performance metrics
- Error tracking

### Custom Monitoring

Add monitoring service:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Plausible** - Privacy-friendly analytics

---

## Troubleshooting

### WebSocket connection fails

- Check if gateway is running
- Verify gateway URL is correct
- Check firewall settings
- Ensure CORS is configured on gateway

### Build fails

```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Environment variables not working

- Vercel: Redeploy after adding env vars
- Local: Restart dev server after changing `.env.local`
- Docker: Pass env vars with `-e` flag

---

## Scaling Considerations

For high traffic:

1. **CDN**: Vercel/Netlify include global CDN
2. **Database**: Add database for chat persistence
3. **Caching**: Implement Redis for session data
4. **Load Balancing**: Multiple gateway instances
5. **Monitoring**: Set up alerts for downtime

---

## Backup Strategy

### Code
- GitHub is your source of truth
- Enable branch protection rules
- Require PR reviews before merging

### Data (Future)
When implementing persistence:
- Daily database backups
- Chat history exports
- User settings backups

---

## Need Help?

- Check GitHub Issues
- Review TROUBLESHOOTING.md
- Ask in project discussions
