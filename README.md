# 🤖 Simple AI Chatbot (Gemini-powered)

A clean, beginner-friendly AI chatbot built with **vanilla HTML/CSS/JS** on the frontend and **Node.js + Express** on the backend. It talks to **Google's Gemini API**, and your API key never touches the browser.

---

## 📁 Project Structure

```
project/
│
├── server.js          # Express backend — handles /chat requests to Gemini
├── package.json        # Node dependencies & npm scripts
├── .env.example         # Template for your environment variables
├── .gitignore           # Keeps .env and node_modules out of Git
├── README.md            # You're reading it
└── public/
    ├── index.html        # Chat UI markup
    ├── style.css          # Modern, responsive styling
    └── script.js           # Frontend chat logic (fetch calls, DOM updates)
```

### What each file does

| File | Purpose |
|---|---|
| `server.js` | The only place your Gemini API key is used. Exposes `POST /chat` (send a message, get a reply) and `POST /clear` (reset conversation memory). Also serves the `public/` folder as static files. |
| `public/index.html` | The skeleton of the chat window: header, message area, typing indicator, input box. |
| `public/style.css` | All visual styling — chat bubbles, colors, animations, responsive layout. Uses CSS variables so it's easy to re-theme. |
| `public/script.js` | Runs in the browser. Sends user messages to `/chat` via `fetch`, renders bubbles with timestamps, shows the typing indicator, and handles errors. |
| `.env` (you create this) | Holds your real `GEMINI_API_KEY`. Never committed to Git. |

---

## 1️⃣ Install Dependencies

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed. Then, in the project folder:

```bash
npm install
```

This installs `express`, `@google/generative-ai`, `dotenv`, and `cors`.

---

## 2️⃣ Add Your API Key

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste in your real Gemini API key:
   ```
   GEMINI_API_KEY=your-real-key-here
   PORT=3000
   ```
3. Get a **free** key from **Google AI Studio**: https://aistudio.google.com/app/apikey

⚠️ **Never** commit `.env` to Git — it's already listed in `.gitignore`.

---

## 3️⃣ Run the Project

**Standard start:**
```bash
npm start
```

**Development mode (auto-restarts on file changes — requires nodemon):**
```bash
npm install -g nodemon   # if you don't already have it
npm run dev
```

Then open your browser to:
```
http://localhost:3000
```

You should see the chat UI. Type a message and press **Enter** (or click the send button) to chat with the AI.

---

## 4️⃣ Deploy It

This is a standard Node/Express app, so it works on almost any Node hosting platform. A few common options:

### Option A — Render.com (free tier available)
1. Push your project to a GitHub repo (`.env` stays out thanks to `.gitignore`).
2. On Render, create a **New Web Service** → connect your repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add an environment variable in Render's dashboard: `GEMINI_API_KEY = your-key`.
6. Deploy — Render gives you a public URL.

### Option B — Railway.app
1. Push to GitHub, then "New Project" → "Deploy from GitHub repo" on Railway.
2. Add `GEMINI_API_KEY` under the project's **Variables** tab.
3. Railway auto-detects Node and runs `npm start`.

### Option C — A VPS (e.g., DigitalOcean, AWS EC2)
1. Install Node.js on the server.
2. Clone your repo, run `npm install --production`.
3. Create a `.env` file directly on the server (never upload it via Git).
4. Run the app with a process manager so it stays alive:
   ```bash
   npm install -g pm2
   pm2 start server.js --name chatbot
   ```
5. Put it behind Nginx (reverse proxy) for HTTPS with a real domain.

**In all cases:** the API key is set as a server-side environment variable — never hard-code it into any file you deploy.

---

## 5️⃣ Customize the Chatbot

- **Change the AI's personality** — edit the `systemInstruction` in `server.js`:
  ```js
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are a friendly, helpful assistant...',
  });
  ```
  Make it a coding tutor, a customer support bot, a study buddy — just change the text.

- **Switch the model** — in `server.js`, change:
  ```js
  model: 'gemini-1.5-flash',
  ```
  to `'gemini-1.5-pro'` for higher-quality (but slower/pricier) responses, or a newer Gemini model if your account has access.

- **Re-theme the colors** — all colors live as CSS variables at the top of `style.css`:
  ```css
  :root {
    --color-primary: #4f46e5;   /* change this for a different accent color */
    --color-bg: #eef1f7;
  }
  ```

- **Adjust reply length/creativity** — in `server.js`, tweak the `generationConfig`:
  ```js
  generationConfig: {
    temperature: 0.7,      // higher = more creative/random, lower = more focused
    maxOutputTokens: 500,  // maximum length of each AI reply
  }
  ```

- **Persist chat history across restarts** — currently, conversation history lives in memory (`conversationHistory` array in `server.js`) and resets when the server restarts. To make it permanent, swap that array for a database (e.g. SQLite, MongoDB, Redis) keyed by user/session ID.

- **Add multi-user support** — right now, everyone hitting the server shares one `conversationHistory`. For a real multi-user product, store history per session (e.g. using `express-session` + a database) instead of a single global array.

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `❌ ERROR: GEMINI_API_KEY is missing` on startup | You forgot to create `.env`. Run `cp .env.example .env` and add your key. |
| `500` "invalid API key" errors when chatting | Your API key is invalid, disabled, or mistyped — generate a new one at [Google AI Studio](https://aistudio.google.com/app/apikey). |
| `429` errors when chatting | You've hit Gemini's rate limit or free-tier quota — wait a bit or check your quota in Google AI Studio. |
| Blank page at `localhost:3000` | Make sure `npm start` is actually running and check the terminal for errors. |

---

Built as a minimal, hackable starting point — feel free to rip it apart and make it your own. 🚀
