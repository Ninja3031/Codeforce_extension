console.log("CF Extension Loaded 🚀");

const getContestId = () => {
  const match = window.location.pathname.match(/(?:contest|gym)\/(\d+)/);
  return match ? match[1] : null;
};

// 2️⃣ Detect user handle
const getUserHandle = () => {
  const profileLinks = document.querySelectorAll('a[href^="/profile/"]');
  for (const link of profileLinks) {
    const parentText = link.parentElement.innerText;
    if (parentText.includes("Logout") || parentText.includes("Выйти")) {
      return link.innerText.trim();
    }
  }
  return null;
};

let currentLeaderboard = [];
let isMinimized = localStorage.getItem("cf-tracker-minimized") === "true";

// 3️⃣ Network Requests
const fetchAPI = (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "API_REQUEST",
        method,
        url: `http://localhost:8000${endpoint}`,
        body
      },
      (response) => {
        if (!response || response.error) {
          reject(response?.error || "Network error");
        } else {
          resolve(response);
        }
      }
    );
  });
};

const refreshData = async (handle) => {
  const contestId = getContestId();
  if (!contestId) {
    if (!isMinimized) renderMessage("Not a contest page. Leaderboard inactive.");
    return;
  }

  isMinimized ? renderMinimizedBtn() : renderMessage("⏳ Syncing updates...");

  try {
    const data = await fetchAPI("GET", `/api/contest/friends?handle=${handle}&contestId=${contestId}`);
    if (data.leaderboard) {
      currentLeaderboard = data.leaderboard;
      if (!isMinimized) renderMainView(handle);
    }
  } catch (err) {
    if (!isMinimized) renderMessage(`❌ Error: ${err}`);
  }
};

const submitFriends = async (handle, rawText) => {
  if (!rawText.trim()) return;
  const friendsArray = rawText.split(/[\s,]+/).filter(Boolean);
  
  try {
    renderMessage("⏳ Adding friends...");
    await fetchAPI("POST", "/api/friends", { handle, friends: friendsArray });
    await refreshData(handle);
  } catch (err) {
    renderMessage(`❌ Failed: ${err}`);
    setTimeout(() => renderMainView(handle), 2000); // revert to view
  }
};

// 4️⃣ UI Renderers
const getOrCreateElement = (id, tag, className) => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement(tag);
    el.id = id;
    if (className) el.className = className;
    document.body.appendChild(el);
  }
  return el;
};

const toggleMinimize = (handle, state) => {
  isMinimized = state;
  localStorage.setItem("cf-tracker-minimized", isMinimized);
  
  if (isMinimized) {
    getOrCreateElement("cf-widget-container", "div").classList.add("cf-hidden");
    renderMinimizedBtn();
  } else {
    document.getElementById("cf-minimized-btn")?.classList.add("cf-hidden");
    getOrCreateElement("cf-widget-container", "div").classList.remove("cf-hidden");
    renderMainView(handle);
  }
};

const renderMinimizedBtn = () => {
  const btn = getOrCreateElement("cf-minimized-btn", "button", "cf-minimized-btn");
  btn.classList.remove("cf-hidden");
  btn.innerHTML = "👁️";
  btn.title = "Open CF Tracker";
  btn.onclick = () => toggleMinimize(getUserHandle() || "Unknown", false);
};

const renderMessage = (msg) => {
  const container = getOrCreateElement("cf-widget-container", "div", "cf-leaderboard");
  container.innerHTML = `
    <div class="cf-header">
      <h3>👥 CF Tracker</h3>
      <button class="cf-close-btn" title="Minimize">✖</button>
    </div>
    <p style="text-align:center; font-size:12px; margin: 10px 0;">${msg}</p>
  `;
  container.querySelector(".cf-close-btn").onclick = () => toggleMinimize(null, true);
};

const renderMainView = (currentUser) => {
  const container = getOrCreateElement("cf-widget-container", "div", "cf-leaderboard");
  
  // Decide Welcome Flow vs Leaderboard Flow
  const hasFriends = currentLeaderboard.length > 1;

  container.innerHTML = `
    <div class="cf-header">
      <h3>👥 CF Tracker</h3>
      <button class="cf-close-btn" title="Minimize">✖</button>
    </div>
    
    ${!hasFriends ? `
      <div class="cf-welcome">
        <p>Welcome! Add some Codeforces handles to track friends in this contest.</p>
      </div>
    ` : `
      <ul>
        ${currentLeaderboard.map((user, index) => {
          const isMe = user.handle === currentUser;
          let rankClass = "";
          if (index === 0) rankClass = "cf-top1";
          else if (index === 1) rankClass = "cf-top2";
          else if (index === 2) rankClass = "cf-top3";

          return `
            <li class="${rankClass} ${isMe ? "cf-me" : ""}">
              <span class="cf-rank">${index + 1}</span>
              <span class="cf-handle">${user.handle}</span>
              <span class="cf-solved">${user.solved}</span>
            </li>
          `;
        }).join("")}
      </ul>
    `}

    <div class="cf-add-friend-box">
      <input type="text" id="cf-friend-input" placeholder="Add handles (tourist, ecnerwala)" />
    </div>
  `;

  container.querySelector(".cf-close-btn").onclick = () => toggleMinimize(currentUser, true);
  
  const input = container.querySelector("#cf-friend-input");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitFriends(currentUser, input.value);
    }
  });
};

// 5️⃣ Initialize Loop
const waitForHandle = (callback) => {
  let attempts = 0;
  const interval = setInterval(() => {
    const handle = getUserHandle();
    attempts++;

    if (handle) {
      clearInterval(interval);
      console.log("Detected handle:", handle);
      callback(handle);
    } else if (attempts > 20) { // Timeout after 10s
      clearInterval(interval);
      renderMessage("Please log in to Codeforces first!");
    }
  }, 500);
};

// 6️⃣ Initialize
if (isMinimized) {
  renderMinimizedBtn();
} else {
  renderMessage("⏳ Initializing Tracker...");
}

waitForHandle((handle) => {
  refreshData(handle);

  // 🔁 auto refresh every 60 seconds
  setInterval(() => refreshData(handle), 60000);
});