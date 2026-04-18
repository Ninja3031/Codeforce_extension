# Codeforces Friends Tracker & Auto-GitHub Sync 🚀

An ultra-premium Chrome Extension and Node.js backend system designed for competitive programmers. This extension injects a sleek, state-of-the-art glassmorphism leaderboard natively into [Codeforces](https://codeforces.com) contest pages to track your friends' live progress, while silently syncing your accepted problem submissions directly to your GitHub repository!

## ✨ Features

- **Live Leaderboard Tracking**: See exactly what your friends are solving during active contests with real-time Codeforces API synchronizations.
- **Auto GitHub Sync**: A background Redis worker proxy seamlessly catches your `Accepted` submissions and commits the raw code directly to your GitHub repository.
- **Aalto-Inspired Premium UI**: Toggle between beautiful Light & Dark highly saturated Glassmorphism interfaces built natively for Chrome.
- **Live Notifications**: Get native Operating System Desktop alert toasts whenever your tracking rivals solve a new problem.
- **Deep Integrations**: Hover over their CF handles to see exact CF Rankings and live Rating arrays, and hover over their scores to see precise problem arrays (e.g., `[A, C, D]`).

---

## 🛠 Tech Stack

- **Extension**: Vanilla JavaScript, Chrome Extension Manifest V3, CSS3 Glassmorphism
- **Backend API**: Node.js, Express.js
- **Database Engine**: MongoDB (Mongoose)
- **Queue / Workers**: BullMQ, Redis (for robust, decoupled rate-limit safe GitHub Pushing)
- **External APIs**: Codeforces Official API, GitHub REST API v3

---

## 🚀 Installation & Setup Guide

Since this extension communicates with a private backend for queue handling and database storage, you must configure both the Node.js Server and the Chrome Extension locally.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18+)
- Local or Cloud **MongoDB** Database Instance
- Redis Server (make sure [`redis-server`](https://redis.io/docs/getting-started/) is actively running locally on port 6379, or configure a cloud Redis URL)
- A [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens) with `repo` scopes.

### 2. Backend Server Configuration

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/Codeforces-Tracker-Sync.git
   cd Codeforces-Tracker-Sync/apps/server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file inside the `apps/server` directory and configure the variables:
   ```env
   # Server config
   PORT=8000
   
   # Database Connections
   MONGO_URI=mongodb://localhost:27017/cf-tracker
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   
   # GitHub Auto-Sync Setup
   GITHUB_TOKEN=ghp_YourPersonalAccessTokenHere
   GITHUB_USERNAME=your_github_username
   GITHUB_REPO=your_target_repo_name
   ```

4. **Boot the Backend**
   ```bash
   npm run dev
   ```
   *The server should boot up reporting connections to both MongoDB and the Redis Queue!*

### 3. Chrome Extension Installation

1. Open a new tab in Chrome and navigate to `chrome://extensions/`.
2. Toggle on **"Developer mode"** in the top right corner.
3. Click the **"Load unpacked"** button in the top left.
4. In your file explorer, select the `extension` folder located inside this repository root.
5. Make sure the extension toggles to **Active**.

---

## 💻 Usage

1. Navigate to any active or past contest on [Codeforces](https://codeforces.com).
2. The UI will instantly mount to the right side of your screen. 
   *(Note: You must be logged into your Codeforces account so the extension can accurately track who you are).*
3. Type CF Handles (comma-separated, e.g., `tourist, ecnerwala`) into the glowing input box and press **Enter**.
4. Submit code normally! If you get a green `Accepted`/`OK` verdict, the Extension will instantly fire the code down to your Node server, ping Redis, and push it directly into your GitHub Repo with zero clicks required!

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request!
