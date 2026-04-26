# agentlyze — AI Adoption Platform MVP

> Stop overthinking. Start implementing.

## Deploy to agentlyze.ai in ~10 minutes

### What you need
- A [GitHub](https://github.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- Your [Anthropic API key](https://console.anthropic.com) (get one at console.anthropic.com)
- Your domain already pointed to Vercel (or configured after deploy)

---

## Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) → click **New repository**
2. Name it `agentlyze`, set to **Private**, click **Create**
3. On your computer, open Terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentlyze.git
git push -u origin main
```

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → click **Add New Project**
2. Click **Import** next to your `agentlyze` GitHub repo
3. Leave all settings as default — Vercel auto-detects Vite
4. Click **Deploy** — it builds in ~60 seconds

---

## Step 3 — Add your API key

1. In Vercel, open your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from console.anthropic.com)
   - **Environments:** Production, Preview, Development ✓ all three
3. Click **Save**
4. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy**

---

## Step 4 — Connect your domain

1. In Vercel → your project → **Settings** → **Domains**
2. Click **Add Domain** → type `agentlyze.ai`
3. Vercel will show you DNS records to add
4. Go to your domain registrar (where you bought agentlyze.ai) and add those records
5. Wait 2–10 minutes for DNS to propagate

Your site is live at **agentlyze.ai** ✓

---

## Local development

```bash
# Install dependencies
npm install

# Copy env file and add your API key
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run locally (Vercel CLI proxies the API routes)
npx vercel dev

# Or just the frontend (API calls will fail without vercel dev)
npm run dev
```

---

## Project structure

```
agentlyze/
├── api/
│   └── assess.js        ← Serverless function (API key lives here, never exposed)
├── src/
│   ├── main.jsx         ← React entry point
│   └── App.jsx          ← Full application (all screens + logic)
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── vercel.json          ← Routing rules
└── package.json
```

## How the API key stays secure

The browser never sees your Anthropic API key.

1. User fills out the assessment form in the browser
2. Browser sends answers to `/api/assess` (your own server)
3. The serverless function in `api/assess.js` reads `ANTHROPIC_API_KEY` from Vercel's secure environment
4. The function calls Anthropic's API server-to-server
5. The result comes back to the browser

---

## Customisation tips

- **Branding**: Edit color tokens at the top of `src/App.jsx` (`const C = {...}`)
- **Questions**: Add/remove items in the `INDUSTRIES`, `WORKFLOW_AREAS`, `PAIN_POINTS`, `BUDGETS` arrays
- **AI prompt**: Edit the prompt string in `api/assess.js` to adjust the output format
- **CTA button**: Search for "Book a Free Strategy Call" to update the link/text

---

Made with ❤️ for the agentlyze.ai MVP
