console.log("CF Extension Tracker active");

const getContestId = () => {
  const match = window.location.pathname.match(/(?:contest|gym)\/(\d+)/);
  return match ? match[1] : null;
};

// Fast and robust handle extraction
const getUserHandle = () => {
  const header = document.querySelector("#header") || document.body;
  const links = header.querySelectorAll('a[href*="/profile/"]');
  for (const a of links) {
    const parentText = a.parentElement?.textContent?.toLowerCase() || "";
    if (parentText.includes("logout") || parentText.includes("выйти")) {
      return a.textContent.trim();
    }
  }
  if (links.length > 0) return links[0].textContent.trim();
  return null;
};

let currentLeaderboard = [];
let isMinimized = localStorage.getItem("cf-tracker-minimized") === "true";
let isDarkMode = localStorage.getItem("cf-theme") === "dark";

// Network Requests
const fetchAPI = (method, endpoint, body = null) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "API_REQUEST", method, url: `http://localhost:8000${endpoint}`, body },
      (response) => {
        if (!response || response.error) reject(response?.error || "Network error");
        else resolve(response);
      }
    );
  });
};

const sendNotification = (title, message) => {
  chrome.runtime.sendMessage({
    type: "SHOW_NOTIFICATION",
    notificationId: "cf-alert-" + Date.now(),
    title,
    message
  });
};

const refreshData = async (handle) => {
  const contestId = getContestId();
  if (!contestId) {
    if (!isMinimized) renderMessage("Not a contest page. Leaderboard inactive.");
    return;
  }

  isMinimized ? renderMinimizedBtn() : null; // Silent load if minimized

  try {
    const data = await fetchAPI("GET", `/api/contest/friends?handle=${handle}&contestId=${contestId}`);
    if (data.leaderboard) {
      
      // Diff Notification Engine
      if (currentLeaderboard.length > 0) {
        data.leaderboard.forEach(newUser => {
          const oldUser = currentLeaderboard.find(u => u.handle === newUser.handle);
          if (oldUser && newUser.solved > oldUser.solved) {
            // Find exactly which problem was solved
            const newProblems = newUser.solvedList || [];
            const oldProblems = oldUser.solvedList || [];
            const newlySolved = newProblems.filter(p => !oldProblems.includes(p));
            
            const probTitle = newlySolved.length > 0 ? `Problem ${newlySolved.join(", ")}` : "a new problem";
            sendNotification("CF Friend Progress!", `${newUser.handle} just solved ${probTitle} 🚀`);
          }
        });
      }

      currentLeaderboard = data.leaderboard;
      if (!isMinimized) renderMainView(handle);
    }
  } catch (err) {
    if (!isMinimized) renderMessage(` Error: ${err}`);
  }
};

const submitFriends = async (handle, rawText) => {
  if (!rawText.trim()) return;
  const friendsArray = rawText.split(/[\s,]+/).filter(Boolean);
  try {
    renderMessage("Adding friends...");
    await fetchAPI("POST", "/api/friends", { handle, friends: friendsArray });
    await refreshData(handle);
  } catch (err) {
    renderMessage(` Failed: ${err}`);
    setTimeout(() => renderMainView(handle), 2000);
  }
};

const removeFriendTrigger = async (handle, deleteTargetHandle) => {
  try {
    renderMessage("Restructuring ranking...");
    await fetchAPI("DELETE", "/api/friends", { handle, friendHandle: deleteTargetHandle });
    await refreshData(handle);
  } catch (err) {
    renderMessage(` Failed to delete: ${err}`);
    setTimeout(() => renderMainView(handle), 2000);
  }
};

// UI Renderers
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

// Bind Theme to Container
const applyTheme = (container) => {
  if (isDarkMode) {
    container.classList.add("cf-dark-mode");
  } else {
    container.classList.remove("cf-dark-mode");
  }
};

const toggleTheme = (handle) => {
  isDarkMode = !isDarkMode;
  localStorage.setItem("cf-theme", isDarkMode ? "dark" : "light");
  if (!isMinimized) renderMainView(handle);
};

const toggleMinimize = (handle, state) => {
  isMinimized = state;
  localStorage.setItem("cf-tracker-minimized", isMinimized);
  
  if (isMinimized) {
    getOrCreateElement("cf-widget-container", "div").classList.add("cf-hidden");
    renderMinimizedBtn();
  } else {
    document.getElementById("cf-minimized-btn")?.classList.add("cf-hidden");
    const container = getOrCreateElement("cf-widget-container", "div");
    container.classList.remove("cf-hidden");
    applyTheme(container);
    renderMainView(handle);
  }
};

const renderMinimizedBtn = () => {
  const btn = getOrCreateElement("cf-minimized-btn", "button", "cf-minimized-btn");
  btn.classList.remove("cf-hidden");
  btn.innerHTML = "View";
  btn.title = "Open CF Tracker";
  btn.onclick = () => toggleMinimize(getUserHandle() || "Unknown", false);
};

const renderMessage = (msg) => {
  const container = getOrCreateElement("cf-widget-container", "div", "cf-leaderboard");
  applyTheme(container);
  container.innerHTML = `
    <div class="cf-header">
      <h3> CF Tracker</h3>
      <button class="cf-close-btn" title="Minimize">✖</button>
    </div>
    <p style="text-align:center; font-size:12px; margin: 10px 0;">${msg}</p>
  `;
  container.querySelector(".cf-close-btn").onclick = () => toggleMinimize(null, true);
};

// Map CF string rank to CSS class
const getRankClass = (rankStr) => {
  if (!rankStr) return "";
  return "rank-" + rankStr.toLowerCase().replace(/\s+/g, '-');
};

const renderMainView = (currentUser) => {
  const container = getOrCreateElement("cf-widget-container", "div", "cf-leaderboard");
  applyTheme(container);
  const hasFriends = currentLeaderboard.length > 1;

  container.innerHTML = `
    <div class="cf-header">
      <h3> CF Tracker</h3>
      <div style="display:flex; align-items:center;">
        <label class="cf-theme-switch" title="Toggle Dark Mode">
          <input type="checkbox" id="cf-theme-toggle" ${isDarkMode ? "checked" : ""} />
          <span class="cf-slider"></span>
        </label>
        <button class="cf-close-btn" title="Minimize">✖</button>
      </div>
    </div>
    
    ${!hasFriends ? `
      <div class="cf-welcome">
        <p>Welcome! Add some Codeforces handles to track friends in this contest.</p>
      </div>
    ` : `
      <ul>
        ${currentLeaderboard.map((user, index) => {
          const isMe = user.handle === currentUser;
          let trClass = "";
          if (index === 0) trClass = "cf-top1";
          else if (index === 1) trClass = "cf-top2";
          else if (index === 2) trClass = "cf-top3";
          
          const rankColorClass = getRankClass(user.rank);
          const solvedStr = (user.solvedList && user.solvedList.length > 0) 
                            ? `[${user.solvedList.join(",")}]` : "";

          return `
            <li class="${trClass} ${isMe ? "cf-me" : ""} ${rankColorClass}" title="${user.rank || 'Unrated'} (${user.rating || 0})">
              <div style="display:flex; align-items:center;">
                 <span class="cf-rank">${index + 1}</span>
                 <span class="cf-handle" title="Rating: ${user.rating}">${user.handle}</span>
              </div>
              <div style="display:flex; align-items:center;">
                 <span class="cf-solved-hover">${solvedStr}</span>
                 <span class="cf-solved" style="margin-left:8px;">${user.solved}</span>
                 ${!isMe ? `<button class="cf-del-btn" data-handle="${user.handle}" title="Remove Friend">X</button>` : ""}
              </div>
            </li>
          `;
        }).join("")}
      </ul>
    `}

    <div class="cf-add-friend-box">
      <input type="text" id="cf-friend-input" autocomplete="off" placeholder="Add handles (tourist, ecnerwala)" />
    </div>
  `;

  // Bind close & theme
  container.querySelector(".cf-close-btn").onclick = () => toggleMinimize(currentUser, true);
  const themeToggle = container.querySelector("#cf-theme-toggle");
  if (themeToggle) {
    themeToggle.onchange = () => toggleTheme(currentUser);
  }
  
  // Bind input 
  const input = container.querySelector("#cf-friend-input");
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitFriends(currentUser, input.value);
    }
  });

  // Bind Deletion Buttons
  const delBtns = container.querySelectorAll(".cf-del-btn");
  delBtns.forEach(btn => {
    btn.onclick = (e) => {
      const target = e.target.getAttribute("data-handle");
      if (target) removeFriendTrigger(currentUser, target);
    };
  });
};

// Initialize Loop
const waitForHandle = (callback) => {
  let attempts = 0;
  const interval = setInterval(() => {
    const handle = getUserHandle();
    attempts++;

    if (handle) {
      clearInterval(interval);
      callback(handle);
    } else if (attempts > 10) { 
      clearInterval(interval);
      if (!isMinimized) renderMessage("Please log in to Codeforces first!");
    }
  }, 250);
};

// Kickoff
if (isMinimized) {
  renderMinimizedBtn();
} else {
  const container = getOrCreateElement("cf-widget-container", "div", "cf-leaderboard");
  applyTheme(container);
  container.innerHTML = `
    <div class="cf-header">
      <h3> CF Tracker</h3>
      <button class="cf-close-btn" title="Minimize">✖</button>
    </div>
    <div style="display:flex; justify-content:center; align-items:center; height:100px;">
        <span style="opacity:0.6; font-size:14px;">Syncing...</span>
    </div>
  `;
  container.querySelector(".cf-close-btn").onclick = () => toggleMinimize(null, true);
}

waitForHandle((handle) => {
  refreshData(handle);
  setInterval(() => refreshData(handle), 60000);
});