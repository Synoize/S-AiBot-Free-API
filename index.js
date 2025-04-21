const html = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const chatBox = document.getElementById("chatBox");
const chatContainer = document.getElementById("chatContainer");

// Theme
if (localStorage.getItem("theme") === "dark") {
  html.classList.add("dark");
  themeIcon.className = "ph ph-sun";
}

function toggleDarkMode() {
  html.classList.toggle("dark");
  const isDark = html.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeIcon.className = isDark ? "ph ph-sun" : "ph ph-moon";
}

// Restore chat from localStorage
const savedMessages = JSON.parse(localStorage.getItem("chatHistory")) || [];
savedMessages.forEach(msg => {
  appendMessage(msg.content, msg.type, false);
});

async function sendResponse() {
  const input = document.getElementById("userInput");
  const userInput = input.value.trim();
  if (!userInput) return;

  appendMessage(userInput, 'user');
  saveMessage(userInput, 'user');
  input.value = '';

  const botMessageElement = appendMessage("Thinking...", 'bot');

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "HTTP-Referer": "https://synoize.netlify.app/",
        "X-Title": "Synoize",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: userInput }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response received.";
    botMessageElement.innerHTML = marked.parse(reply);
    saveMessage(reply, 'bot');

  } catch (error) {
    botMessageElement.innerHTML = `<span class="text-red-500">Error:</span> ${error.message}`;
    saveMessage("Error: " + error.message, 'bot');
  }

  scrollToBottom();
}

function appendMessage(content, type, escape = true) {
  const wrapper = document.createElement("div");
  wrapper.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;

  const bubble = document.createElement("div");
  bubble.className = `max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow transition whitespace-pre-line ${type === 'user'
      ? 'bg-black text-white dark:bg-white dark:text-black'
      : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'
    }`;

  if (type === 'bot' && !escape) {
    bubble.innerHTML = content;
  } else {
    bubble.innerText = content;
  }

  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  scrollToBottom();
  return bubble;
}

function saveMessage(content, type) {
  const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
  history.push({ content, type });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}

function clearChat() {
  localStorage.removeItem("chatHistory");
  chatBox.innerHTML = '';
}

document.getElementById("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendResponse()
  };
});