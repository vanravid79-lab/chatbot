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
      messenger/webhook/route.js    # Verifies and receives Meta webhooks
    page.js                         # Home page
    layout.js                       # App shell and page metadata
    globals.css                    # Global and chat UI styles
  components/
    chatbot/                        # Chat window and reusable UI pieces
  lib/
    excel.js                        # Reads FAQ questions from the workbook
    faqSearch.js                    # Matches message text to an FAQ
  services/
    messengerService.js             # Sends Messenger replies
data/
  RC_Labs.xlsx                      # FAQ source data
```

The website UI lives in `components/chatbot`. API route files handle HTTP
requests, `lib` contains reusable FAQ data and matching helpers, and `services`
contains integrations such as Messenger.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

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
