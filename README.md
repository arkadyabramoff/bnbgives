# BNB Gives Project

## Deployment to Vercel

This project is configured to deploy to Vercel with secure Telegram integration using environment variables.

### Setup Instructions

#### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

#### 2. Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

   - **Name:** `TELEGRAM_BOT_TOKEN`
     **Value:** `Your Telegram BOT`
   
   - **Name:** `TELEGRAM_CHAT_ID`
     **Value:** `Your Telegram Chat ID`

4. Make sure to select **Production**, **Preview**, and **Development** environments

#### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel
3. Vercel will automatically detect and deploy

**Option B: Via CLI**
```bash
vercel
```

### Project Structure

```
├── api/
│   └── telegram.js          # Serverless function (handles Telegram API calls securely)
├── index.html               # Main HTML file
├── newe5bf.js               # Frontend JavaScript (no credentials exposed)
├── vercel.json              # Vercel configuration
└── .gitignore               # Git ignore file (excludes .env files)
```

### Security

- ✅ Telegram credentials are stored as **environment variables** in Vercel
- ✅ Credentials are **never exposed** in client-side code
- ✅ All Telegram API calls are made **server-side** via `/api/telegram` route
- ✅ Even with inspect element, credentials remain hidden

### Testing Locally

For local testing, create a `.env.local` file in the root directory:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

Then run:
```bash
vercel dev
```

This will use your environment variables for local development.

