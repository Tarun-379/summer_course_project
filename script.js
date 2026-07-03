// ==============================================================
// script.js
// --------------------------------------------------------------
// This is the FRONTEND logic for the chatbot UI.
// It runs entirely in the browser and NEVER touches the OpenAI
// API key — all AI requests go through our own backend at
// POST /chat, which is defined in server.js.
//
// Responsibilities:
//   - Render user & bot chat bubbles with timestamps
//   - Auto-scroll to the latest message
//   - Send messages on button click or Enter key
//   - Show/hide a typing indicator while waiting for a reply
//   - Handle and display errors in a friendly way
//   - Clear the chat history (UI + server memory)
// ==============================================================

// ---- 1. Grab references to DOM elements we'll need ------------
const chatWindow = document.getElementById('chatWindow');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const typingIndicator = document.getElementById('typingIndicator');

// ---- 2. Helper: format a timestamp like "10:42 AM" -------------
function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---- 3. Helper: scroll chat window to the newest message --------
function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ---- 4. Helper: remove the initial welcome message once chat starts
function removeWelcomeMessage() {
  const welcome = chatWindow.querySelector('.welcome-message');
  if (welcome) welcome.remove();
}

// ---- 5. Render a single chat bubble (user or bot) ----------------
function appendMessage(text, sender, isError = false) {
  removeWelcomeMessage();

  const row = document.createElement('div');
  row.className = `message-row ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = `bubble${isError ? ' error' : ''}`;
  bubble.textContent = text;

  const time = document.createElement('span');
  time.className = 'timestamp';
  time.textContent = formatTime();

  row.appendChild(bubble);
  row.appendChild(time);
  chatWindow.appendChild(row);

  scrollToBottom();
}

// ---- 6. Show / hide the "bot is typing..." indicator --------------
function setTypingIndicator(visible) {
  typingIndicator.classList.toggle('hidden', !visible);
  if (visible) scrollToBottom();
}

// ---- 7. Auto-resize the textarea as the user types -----------------
function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
}
userInput.addEventListener('input', autoResizeTextarea);

// ---- 8. Enable/disable the send button based on input content -------
function updateSendButtonState() {
  sendBtn.disabled = userInput.value.trim().length === 0;
}
userInput.addEventListener('input', updateSendButtonState);
updateSendButtonState(); // run once on page load

// ---- 9. Core function: send the user's message to the backend -------
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return; // don't send empty messages

  // 9a. Show the user's own message immediately
  appendMessage(message, 'user');

  // 9b. Reset the input box
  userInput.value = '';
  autoResizeTextarea();
  updateSendButtonState();

  // 9c. Show the typing indicator while we wait for the AI
  setTypingIndicator(true);
  sendBtn.disabled = true;

  try {
    // 9d. Call our own backend (NOT OpenAI directly — the key
    // stays safely on the server side).
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    // Try to parse JSON regardless of status code, since our
    // backend sends { error: "..." } on failures too.
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Server responded with an error status (4xx/5xx)
      const friendlyMessage =
        (data && data.error) || 'Something went wrong. Please try again.';
      throw new Error(friendlyMessage);
    }

    if (!data || !data.reply) {
      throw new Error('The AI did not return a valid response.');
    }

    // 9e. Show the bot's reply
    appendMessage(data.reply, 'bot');
  } catch (error) {
    // 9f. Friendly, non-technical error bubble for the user
    console.error('Chat request failed:', error);
    appendMessage(
      `⚠️ ${error.message || 'Unable to reach the server. Check your connection and try again.'}`,
      'bot',
      true
    );
  } finally {
    // 9g. Always hide the typing indicator and re-enable sending
    setTypingIndicator(false);
    updateSendButtonState();
    userInput.focus();
  }
}

// ---- 10. Wire up the Send button click ------------------------------
sendBtn.addEventListener('click', sendMessage);

// ---- 11. Wire up "Enter to send" (Shift+Enter = new line) -------------
userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // stop it from adding a newline
    sendMessage();
  }
});

// ---- 12. Clear chat button: wipes UI AND server-side memory -----------
clearChatBtn.addEventListener('click', async () => {
  const confirmed = confirm('Clear the entire conversation?');
  if (!confirmed) return;

  // Clear the visible chat window
  chatWindow.innerHTML = `
    <div class="welcome-message">
      <p>👋 Chat cleared. Ask me anything to get started again.</p>
    </div>
  `;

  // Also clear the conversation history stored on the server,
  // so the AI doesn't remember the old conversation.
  try {
    await fetch('/clear', { method: 'POST' });
  } catch (error) {
    console.warn('Could not clear server-side history:', error);
    // Not critical — the UI is already cleared, so we just log this.
  }
});

// ---- 13. Focus the input field on page load ----------------------------
window.addEventListener('load', () => {
  userInput.focus();
});
