# Aria — Your AI-Powered Personal Assistant

Aria is a voice and text-driven personal assistant that connects directly to the tools you already use — your calendar, email, Slack, Notion, HubSpot, and more. Instead of switching between a dozen apps, you just talk (or type), and Aria handles it.

Ask it to schedule a meeting, draft an email, check what's in your pipeline, append notes to a Notion page, or send a Slack message — all in one place, in natural language.

---

## What Aria Can Do

### Google Workspace
- Check your calendar and find free time slots
- Create, reschedule, or update calendar events
- Search, read, and send emails from Gmail
- Read and write data in Google Sheets

### Slack
- List channels in your workspace
- Read recent messages from any channel
- Send messages or reply to threads

### HubSpot
- Search and create contacts
- View and filter deals by stage
- Create, update, and close support tickets

### Notion
- Search across all your pages and databases
- Read the full content of any page
- Create new pages inside existing ones
- Append notes, tasks, or bullet points to any page

---

## Getting Started

You will need accounts and API credentials from five services. Each section below walks you through exactly where to get them.

---

### 1. Google Gemini API Key

Aria's intelligence runs on Google's Gemini model.

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API key"**
3. Copy the key — you'll use it for both `GEMINI_API_KEY` and `NEXT_PUBLIC_GEMINI_API_KEY` in your `.env.local`

---

### 2. Supabase (Database)

Aria stores your conversation history and integration credentials in Supabase.

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **Project Settings → API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable (anon) key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
4. Run the database migration by executing the SQL file at `supabase/migrations/20260407000000_initial_schema.sql` in your Supabase **SQL Editor**

---

### 3. Google OAuth (Calendar, Gmail, Sheets)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project (or use an existing one)
2. Navigate to **APIs & Services → Library** and enable:
   - Google Calendar API
   - Gmail API
   - Google Sheets API
3. Go to **APIs & Services → OAuth consent screen**
   - Choose **External**, fill in your app name and email
   - Add these scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/spreadsheets`
   - Add yourself as a test user
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Add authorized redirect URI:
     ```
     https://your-domain.vercel.app/api/integrations/google/callback
     ```
5. Copy **Client ID** → `GOOGLE_CLIENT_ID` and **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

### 4. Slack

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **"Create New App" → "From scratch"**
2. Go to **OAuth & Permissions** and add these Bot Token Scopes:
   - `channels:read`
   - `channels:history`
   - `groups:read`
   - `groups:history`
   - `chat:write`
   - `users:read`
3. Under **Redirect URLs**, add:
   ```
   https://your-domain.vercel.app/api/integrations/slack/callback
   ```
4. Go to **Basic Information** and copy:
   - **Client ID** → `SLACK_CLIENT_ID`
   - **Client Secret** → `SLACK_CLIENT_SECRET`
5. Install the app to your workspace

---

### 5. HubSpot

1. Go to [developers.hubspot.com](https://developers.hubspot.com) and click **"Create app"**
2. Inside your app, go to the **Auth** tab and add these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.objects.companies.read`
   - `tickets`
3. Under **Redirect URLs**, add:
   ```
   https://your-domain.vercel.app/api/integrations/hubspot/callback
   ```
4. From the **Auth** tab, copy:
   - **Client ID** → `HUBSPOT_CLIENT_ID`
   - **Client Secret** → `HUBSPOT_CLIENT_SECRET`

---

### 6. Notion

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and click **"New integration"**
2. Set the type to **Public** (this enables OAuth — do not pick Internal)
3. Under **OAuth Domain & URIs**, add your redirect URI:
   ```
   https://your-domain.vercel.app/api/integrations/notion/callback
   ```
4. Under **OAuth Credentials**, copy:
   - **OAuth client ID** → `NOTION_CLIENT_ID`
   - **OAuth client secret** → `NOTION_CLIENT_SECRET`

> **After connecting Notion:** The assistant can only access pages you explicitly grant during the OAuth flow. To share additional pages later, open any page in Notion → click **"..."** → **"Connect to"** → select your integration.

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/personal-assistant
cd personal-assistant

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in all values

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Aria.

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import it at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` under **Vercel → Settings → Environment Variables**
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://yourapp.vercel.app`)
   - Update all OAuth redirect URIs across Google, Slack, HubSpot, and Notion to use the same domain
4. Deploy — then go to **Settings → Integrations** inside the app to connect each service

---

## Connecting Your Tools

Once the app is running, visit **Settings → Integrations** and click **Connect** next to each service. You'll be walked through a standard authorization flow for each one. After connecting, Aria can act on your behalf immediately — no extra configuration required.

---

## Example Prompts

> "What does my schedule look like tomorrow?"

> "Send an email to john@acme.com — subject: Follow up, body: Just checking in on our conversation from last week."

> "Show me all deals in the closed won stage."

> "Create a HubSpot ticket: Payment gateway timing out. Priority: high."

> "Search my Notion for the Q2 roadmap and summarize it."

> "Send a message to the #engineering Slack channel: Deploying at 3pm today."

> "Create a new Notion page called Weekly Review under my Personal space."

> "What emails from this week are still unread?"

> "Find the contact Sarah Johnson in HubSpot and tell me her company."

> "Append to my Daily Notes page: reviewed the Aria integration, everything looks good."

---