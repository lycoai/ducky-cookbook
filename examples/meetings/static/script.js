/**
 * Append a message bubble.
 * @param {string} text Raw (user) or markdown (bot)
 * @param {"user"|"bot"} role
 */
function addMessage(text, role) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  bubble.innerHTML = role === "bot" ? marked.parse(text) : marked.parseInline(text.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  wrapper.appendChild(bubble);

  const chat = document.getElementById("chat");
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(text) {
  addMessage(text, "user");
  try {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    const reply = data.reply || data.response || data.message || JSON.stringify(data);
    addMessage(reply, "bot");
  } catch (err) {
    addMessage(`❌ Error: ${err.message}`, "bot");
  }
}

// Form handler
document.getElementById("inputBar").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  sendMessage(text);
});
