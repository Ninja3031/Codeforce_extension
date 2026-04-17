console.log("CF Extension Loaded 🚀");

// 1️⃣ Extract contestId from URL
const getContestId = () => {
  const parts = window.location.pathname.split("/");
  return parts[2]; // /contest/1850 → 1850
};

// 2️⃣ Your handle (for now hardcode)
const USER_HANDLE = "ninja3031";

// 3️⃣ Fetch leaderboard via background script (FIXED)
const fetchLeaderboard = () => {
  const contestId = getContestId();

  chrome.runtime.sendMessage(
    {
      type: "FETCH_LEADERBOARD",
      url: `http://localhost:8000/api/contest/friends?handle=${USER_HANDLE}&contestId=${contestId}`
    },
    (response) => {
      if (!response) {
        console.error("No response from background");
        return;
      }

      if (response.error) {
        console.error("Error fetching leaderboard:", response.error);
        return;
      }

      renderLeaderboard(response.leaderboard);
    }
  );
};

// 4️⃣ Render UI
const renderLeaderboard = (leaderboard) => {
  // prevent duplicate UI
  const existing = document.querySelector(".cf-leaderboard");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "cf-leaderboard";

  container.innerHTML = `
    <h3>👥 Friends Leaderboard</h3>
    <ul>
      ${leaderboard
        .map(
          (user) => `
        <li>
          <strong>${user.handle}</strong> → ${user.solved} solved
        </li>
      `
        )
        .join("")}
    </ul>
  `;

  document.body.appendChild(container);
};

// 5️⃣ Run
fetchLeaderboard();