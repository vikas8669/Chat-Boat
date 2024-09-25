const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteBtn = document.querySelector("#delete");


let userMessage = null;
let isReasonse = false; 

const apiKey = `AIzaSyCi4I8XNhVub5uodnsw5JKm0wTSXdHcGgE`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const loadLocaldtorageData = () => {
  const saveChats = localStorage.getItem("saveChats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chatList.innerHTML = saveChats || "";
  document.body.classList.toggle("hide-header", saveChats);
  chatList.scrollTo(0, chatList.scrollHeight);
};
loadLocaldtorageData();

// create a new message Element and return that
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement) => {
  const words = text.split(" ");
  let currentIndex = 0;
  const typingInterval = setInterval(() => {
    // append each word to the text element whit a space
    textElement.innerText +=
      (currentIndex === 0 ? "" : " ") + words[currentIndex++];

    // if all world are display
    if (currentIndex === words.length) {
      isReasonse = false;
      clearInterval(typingInterval);
      localStorage.setItem("saveChats", chatList.innerHTML);
    }
  }, 75);
};

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  // send post Request to api users messages
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "content-Type": "application/json" }, // Corrected header
      body: JSON.stringify({
        contents: [
          {
            // Corrected content key
            role: "user",
            parts: [{ text: userMessage }], // Assuming userMessage is a defined variable
          },
        ],
      }),
    });

    if(!response.ok) throw new Error(data.error.message);
    const data = await response.json();
    const apiResult = data?.candidates[0].content.parts[0].text;
    showTypingEffect(apiResult, textElement);
  } catch (error) {
    isReasonse = false;
    textElement.innerText = error.message;
    textElement.classList.add("error"); 
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// showLoadingAnimation while waiting for Api Response
const showLoadingAnimation = () => {
  const html = `    <div class="message-content">
                <img src="gemini.svg" alt="gemini Image" class="avtar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick ="copyMessage(this)" class="material-symbols-outlined icon">content_copy</span>`;
  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);

  generateAPIResponse(incomingMessageDiv);
};

// copy meassage text to the clipboard
const copyMessage = (copyIcon) => {
  const messagetext = copyIcon.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messagetext);
  copyIcon.innerText = "done"; // show tick icon
  setTimeout(() => (copyIcon.innerText = "content_copy"), 1000); // revert icon after 1 seconf
};

// hondel sending handle Outgoing Chat
const handleOutgoingChat = () => {
  userMessage =
    typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isReasonse) return; //exit if there is no massages

  isReasonse = true;

  const html = ` <div class="message-content">
                <img src="bomx.jpg" alt="User Image" class="avtar">
                <p class="text"></p>
            </div>`;
  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatList.appendChild(outgoingMessageDiv);

  typingForm.reset(); // clear input filed
  chatList.scrollTo(0, chatList.scrollHeight);
  document.body.classList.add("hide-header");
  setTimeout(showLoadingAnimation, 500); // show loading animation after delay
};

suggestions.forEach( suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// delete btn listener
deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all message?")) {
    localStorage.removeItem("saveChats");
    loadLocaldtorageData();
  }
});

// prevent Default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
