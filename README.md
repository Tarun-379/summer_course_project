# 🤖 Simple AI Chatbot (Gemini-powered)

A clean, beginner-friendly AI chatbot built with **vanilla HTML/CSS/JS** on the frontend and **Node.js + Express** on the backend. It communicates with **Google Gemini** through the official SDK, while keeping your API key securely on the server.

---

## 📁 Project Structure

```text
project/
│
├── server.js           # Express backend — handles /chat requests to Gemini
├── package.json        # Node dependencies & npm scripts
├── .env.example        # Template for environment variables
├── .gitignore          # Prevents .env and node_modules from being committed
├── README.md
└── public/
    ├── index.html      # Chat UI
    ├── style.css       # Styling
    └── script.js       # Frontend logic
```

### What each file does

| File                | Purpose                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `server.js`         | Runs the Express server, serves the frontend, communicates with the Gemini API, and stores temporary conversation history. |
| `public/index.html` | Main chat interface.                                                                                                       |
| `public/style.css`  | Chatbot styling and responsive layout.                                                                                     |
| `public/script.js`  | Sends messages to the backend and displays AI responses.                                                                   |
| `.env`              | Stores your `GEMINI_API_KEY` and other environment variables. Never commit this file.                                      |

---

# 1️⃣ Installation

Install Node.js (v18 or newer), then run:

```bash
npm install
```

This installs:

* express
* @google/generative-ai
* dotenv
* cors

---

# 2️⃣ Configure the API Key

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

Generate a free API key from Google AI Studio:

https://aistudio.google.com/app/apikey

Never commit your `.env` file.

---

# 3️⃣ Run the Project

Start the server:

```bash
npm start
```

or during development:

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

# 4️⃣ Deployment

The project works on any Node.js hosting provider.

### Render

1. Push the project to GitHub.
2. Create a new Web Service.
3. Build Command:

```bash
npm install
```

4. Start Command:

```bash
npm start
```

5. Add the environment variable:

```
GEMINI_API_KEY=your_api_key
```

Deploy and you're done.

---

### Railway

Deploy directly from GitHub and add the same environment variable under **Variables**.

---

### VPS

```bash
npm install --production
npm install -g pm2
pm2 start server.js --name chatbot
```

Use Nginx as a reverse proxy if deploying publicly.

---

# 5️⃣ Customization

## Change the chatbot personality

Edit the `systemInstruction` inside `server.js`.

```js
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction:
    "You are a friendly, helpful assistant. Keep answers concise and clear.",
});
```

---

## Change the Gemini model

Replace

```js
model: "gemini-2.5-flash"
```

with another supported Gemini model if desired.

Examples include:

* `gemini-2.5-flash`
* `gemini-2.5-flash-lite`
* `gemini-2.0-flash`

Check Google's documentation for the latest supported models.

---

## Adjust creativity

```js
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 500,
}
```

* Higher temperature → more creative.
* Lower temperature → more deterministic.
* Increase `maxOutputTokens` for longer responses.

---

## Change the theme

Modify the CSS variables near the top of `style.css`.

```css
:root {
    --color-primary: #4f46e5;
    --color-bg: #eef1f7;
}
```

---

## Persistent chat history

Currently the chatbot stores conversations only in memory.

To persist conversations after restarting the server, integrate a database such as:

* SQLite
* MongoDB
* PostgreSQL
* Redis

---

## Multi-user support

Currently all users share the same conversation history.

For production applications, store history per user or session using:

* express-session
* JWT authentication
* Database-backed sessions

---

# 🛠️ Troubleshooting

| Problem                                    | Solution                                                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY is missing`                | Create a `.env` file and add your API key.                                                                                                                     |
| `EADDRINUSE: address already in use :3000` | Another application is already using port 3000. Kill the existing process or change the port.                                                                  |
| `404 model not found`                      | You're using an outdated Gemini model name. Update to a currently supported model such as `gemini-2.5-flash` and ensure `@google/generative-ai` is up to date. |
| `429 Too Many Requests`                    | You've exceeded your API quota or rate limit. Wait and try again later.                                                                                        |
| Invalid API key                            | Verify the API key in `.env` and restart the server.                                                                                                           |
| Blank page                                 | Ensure the server is running and that the `public` folder is being served correctly.                                                                           |

---

# 📦 Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* Node.js
* Express.js
* Google Gemini API
* dotenv
* CORS

---

## License

This project is provided as a simple educational starter template. Feel free to modify, extend, and use it in your own projects.

---

Built with ❤️ using Node.js, Express, and Google Gemini.
