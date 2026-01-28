# Secure Vercel Deployment Guide

Complete guide to deploying Jarvis UI on Vercel with maximum security.

## Overview

This deployment involves:
1. **Vercel** - Hosting the Next.js UI (public URL)
2. **Clawdbot Gateway** - Running locally on your machine
3. **Tailscale** - Secure tunnel to connect Vercel to your local gateway
4. **Password Protection** - Vercel's built-in authentication

---

## Prerequisites

- [ ] Vercel account (free tier works)
- [ ] Tailscale account (free tier works)
- [ ] GitHub account with jarvis-ui repo
- [ ] Clawdbot Gateway running locally

---

## Step 1: Install Tailscale (Secure Gateway Access)

Tailscale creates a private network so Vercel can securely reach your local Clawdbot Gateway.

### 1.1 Install Tailscale on Your Mac

```bash
# Install via Homebrew
brew install --cask tailscale

# Start Tailscale
open -a Tailscale

# Login and authenticate (opens browser)
# Follow the prompts to join your Tailscale network
```

### 1.2 Get Your Tailscale Machine Name

```bash
# Show your machine's Tailscale name
tailscale status

# Example output:
# 100.x.x.x   bora-macbook     bora@        macOS   -
#             bora-macbook.tail-scale.ts.net
```

Your gateway will be accessible at: `ws://YOUR-MACHINE-NAME.tail-scale.ts.net:18789`

**Example:** `ws://bora-macbook.tail-scale.ts.net:18789`

### 1.3 Configure Clawdbot Gateway for Tailscale

Update your Clawdbot config to listen on Tailscale interface:

```bash
# Edit your Clawdbot config
nano ~/.clawdbot/config.yaml
```

Find the `gateway` section and ensure it binds to `0.0.0.0` (all interfaces):

```yaml
gateway:
  enabled: true
  host: 0.0.0.0  # Listen on all interfaces (including Tailscale)
  port: 18789
```

Restart Clawdbot:

```bash
clawdbot gateway restart
```

Test connectivity from Tailscale:

```bash
# Check if gateway responds on Tailscale IP
curl -I http://$(tailscale ip -4):18789
```

---

## Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
vercel login
```

### 2.2 Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel:** https://vercel.com/new
2. **Import Git Repository:**
   - Click "Import Project"
   - Select your GitHub account
   - Choose `jarvis-ui` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   | Name | Value | Note |
   |------|-------|------|
   | `NEXT_PUBLIC_GATEWAY_URL` | `ws://YOUR-MACHINE.tail-scale.ts.net:18789` | Replace with your Tailscale URL |
   | `NEXT_PUBLIC_GATEWAY_TOKEN` | `your-token-here` | Get from `~/.clawdbot/config.yaml` |
   | `NEXT_PUBLIC_SESSION_KEY` | `jarvis-ui` | Or any identifier you want |

   ⚠️ **Security Note:** These will be visible in browser. The real security comes from:
   - Tailscale (only your network can reach gateway)
   - Vercel Password Protection (next step)

5. **Deploy:**
   - Click "Deploy"
   - Wait ~1-2 minutes
   - You'll get a URL like: `https://jarvis-ui-xyz.vercel.app`

---

## Step 3: Enable Vercel Password Protection (CRITICAL!)

This prevents anyone on the internet from accessing your UI.

### 3.1 Via Vercel Dashboard

1. Go to your project: https://vercel.com/dashboard
2. Click your `jarvis-ui` project
3. Go to **Settings** → **Deployment Protection**
4. Enable **Password Protection**
   - Set a strong password (Vercel will generate one, or set your own)
   - Click "Save"

### 3.2 What This Does

- Anyone visiting your Vercel URL will see a password prompt
- Only people with the password can access the UI
- Password is stored securely by Vercel
- You can share the password with trusted people only

---

## Step 4: Auto-Deploy on Git Push

Vercel automatically watches your GitHub repo.

### 4.1 How It Works

- **Push to `main` branch** → Vercel deploys automatically
- **Create PR** → Vercel creates preview deployment
- **Merge PR** → Vercel deploys to production

### 4.2 Test It

```bash
cd ~/Desktop/jarvis/jarvis-ui

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify auto-deploy"
git push origin main

# Check Vercel dashboard - should see new deployment
```

Vercel will:
1. Detect the push
2. Run `npm ci` (install dependencies)
3. Run `npm run build`
4. Deploy the new version
5. Send you a notification (if enabled)

---

## Step 5: Access Your Secured UI

### 5.1 From Any Device

1. Open your Vercel URL: `https://jarvis-ui-xyz.vercel.app`
2. Enter the password you set
3. UI loads and connects to your local gateway via Tailscale

### 5.2 On Your Phone

Same as above! Works on mobile browsers too.

---

## Security Layers Explained

| Layer | What It Protects | How |
|-------|------------------|-----|
| **Vercel Password** | UI access | Only people with password can see the page |
| **Tailscale Network** | Gateway access | Only devices in your Tailscale network can reach gateway |
| **Gateway Token** | API access | Even if someone gets gateway URL, they need the token |
| **HTTPS** | Data in transit | Vercel provides automatic SSL/TLS |

**Result:** Triple-layer security. Very hard to breach.

---

## Alternative: Even More Secure (Advanced)

If you want **zero public access**, use Vercel + Tailscale together:

1. Deploy to Vercel as above
2. **Don't set password protection** (Vercel is just serving static files)
3. Access Vercel via Tailscale:
   ```bash
   # Enable Tailscale on your phone/laptop
   # Access Vercel URL normally
   ```
4. Your gateway is already on Tailscale
5. Result: Everything is private, nothing exposed to internet

This is overkill for most use cases, but possible.

---

## Troubleshooting

### Gateway Not Connecting

**Symptom:** UI shows "Disconnected" status

**Check:**
1. Is Clawdbot Gateway running?
   ```bash
   clawdbot gateway status
   ```

2. Is Tailscale active?
   ```bash
   tailscale status
   ```

3. Test gateway directly:
   ```bash
   curl http://$(tailscale ip -4):18789
   ```

4. Check Vercel environment variables:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_GATEWAY_URL` is correct

### Password Not Working

**Symptom:** Can't access Vercel URL

**Fix:**
1. Go to Vercel Dashboard → Settings → Deployment Protection
2. Click "Regenerate Password"
3. Save and use new password

### Auto-Deploy Not Working

**Symptom:** Push to GitHub doesn't trigger deployment

**Fix:**
1. Go to Vercel Dashboard → Settings → Git
2. Check that "Production Branch" is set to `main`
3. Verify GitHub integration is connected
4. Try manual deploy: Vercel Dashboard → Deployments → Redeploy

---

## Updating Environment Variables

If you change your gateway token or Tailscale URL:

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Edit the variable
3. Click "Save"
4. Go to Deployments → Click "..." → "Redeploy"

Changes take effect after redeploy (~1 minute).

---

## Cost Breakdown

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Vercel** | Yes | Unlimited deployments, 100GB bandwidth/month |
| **Tailscale** | Yes | 1 user, up to 100 devices |
| **GitHub** | Yes | Unlimited public/private repos |

**Total Cost:** $0/month for personal use 🎉

---

## Best Practices

1. **Keep gateway token secret** - Don't share it publicly
2. **Use strong Vercel password** - At least 16 characters
3. **Keep Tailscale active** - Gateway won't be reachable if Tailscale is off
4. **Monitor Vercel logs** - Check for suspicious access attempts
5. **Rotate credentials** - Change token/password every few months

---

## Next Steps

- [ ] Enable Vercel Analytics (optional, see usage stats)
- [ ] Set up custom domain (optional, e.g., `jarvis.yourdomain.com`)
- [ ] Configure deployment notifications (Slack/Discord)
- [ ] Add more team members to Tailscale network (if needed)

---

**Questions?** Check the [Vercel Docs](https://vercel.com/docs) or [Tailscale Docs](https://tailscale.com/kb/).
