# RC Labs Cambodia support chatbot

This Next.js app serves the RC Labs FAQ website and can reply to Facebook Page
messages through the Messenger Platform. Messenger replies are matched against
the questions and answers in `data/RC_Labs.xlsx`.

## Project structure

```text
src/
  app/
    api/
      faqs/route.js                 # Serves FAQ data to the chat UI
      faqs/[id]/route.js            # Reads, updates, or deletes one FAQ
      messenger/webhook/route.js    # Verifies and receives Meta webhooks
    page.js                         # Home page
    layout.js                       # App shell and page metadata
    globals.css                    # Global and chat UI styles
  components/
    chatbot/                        # Chat window and reusable UI pieces
  lib/
    faqApi.js                       # Shared FAQ request validation and auth
    excel.js                        # Reads FAQ questions from the workbook
    faqStore.js                     # Reads and writes saved FAQ data
    faqSearch.js                    # Matches message text to an FAQ
  services/
    messengerService.js             # Sends Messenger replies
data/
  RC_Labs.xlsx                      # FAQ source data
  faqs.json                         # Created on the first FAQ write request
```

The website UI lives in `components/chatbot`. API route files handle HTTP
requests, `lib` contains reusable FAQ data and matching helpers, and `services`
contains integrations such as Messenger.

## Manage FAQs with the API

`GET /api/faqs` returns the FAQ list. The first successful `POST`, `PUT`, or
`DELETE` saves a copy of the workbook data to `data/faqs.json`; later requests
read and update that JSON file, leaving the original Excel workbook unchanged.
Use `/api/faqs/{id}` to get, update, or delete one FAQ.

In local development, write requests do not require a token. In production, set
`FAQ_ADMIN_TOKEN` as a private environment variable and send it as a bearer token
in the `Authorization` header. Do not expose or commit this token.

Create a question:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/faqs -Method Post `
  -ContentType "application/json" `
  -Body '{"category":"Products","question":"Where can I buy RC Labs?","answerEnglish":"Contact our Cambodia sales team.","answerKhmer":""}'
```

Get one question by ID:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/faqs/41
```

Replace a question by ID (include all fields):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/faqs/41 -Method Put `
  -ContentType "application/json" `
  -Body '{"category":"Products","question":"Where can I buy RC Labs?","answerEnglish":"Ask our sales team.","answerKhmer":""}'
```

Delete a question by ID:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/faqs/41 -Method Delete
```

In production, write requests return `401` if the token is missing or incorrect,
and `503` if `FAQ_ADMIN_TOKEN` is not configured. Changes are saved on the
server's local filesystem. For production, use a host with persistent writable
storage or move FAQ storage to a database; some serverless hosts do not preserve
local file changes between deployments or instances.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
The development server binds to `127.0.0.1`, so token-free FAQ writes are
available only from this computer.

## Connect a Facebook Page to Messenger

Messenger cannot load the website chat UI inside the Messenger app. Instead,
Meta sends incoming Page messages to this app's webhook, and this app sends FAQ
answers back through the Messenger Send API.

1. Deploy this Next.js app to a host that supports Node.js Route Handlers and
   gives it a public HTTPS URL. Make sure `data/RC_Labs.xlsx` is included in the
   deployment.
2. In the Meta for Developers dashboard, create an app, add the Messenger
   product, and connect your Facebook Page.
3. Configure these server-side environment variables in the hosting dashboard.
   The names and placeholders are listed in `.env.example`; do not add real
   credentials to source control or expose them as `NEXT_PUBLIC_*` variables.
   - `META_APP_SECRET`: the app secret from Meta app settings.
   - `META_VERIFY_TOKEN`: a random string you choose. Use the same value in
     Meta's webhook configuration.
   - `META_PAGE_ACCESS_TOKEN`: a Page access token with permission to send
     messages for the connected Page.
   - `META_GRAPH_API_VERSION`: a supported version, in the format `vNN.N`,
     currently available to your Meta app.
4. In Meta's Messenger Webhooks settings, set the callback URL to
   `https://YOUR-DOMAIN/api/messenger/webhook`, enter the same verify token,
   and subscribe the Page to the `messages` webhook field.
5. Verify the webhook in Meta. Test by sending a text question to your Page.
   The bot only sends replies to incoming user messages and uses FAQ answers
   from the workbook.
6. Before serving messages from people outside your app roles, check Meta's
   current access-level and app-review requirements for the `pages_messaging`
   permission.

The webhook verifies Meta's `X-Hub-Signature-256` signature before processing
events. Keep the app secret and Page access token private. Messenger's standard
messaging window and other platform policies apply to replies.

Meta setup references:

- [Messenger Platform Webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/)
- [Messenger Platform Send API](https://developers.facebook.com/docs/messenger-platform/send-messages/)
