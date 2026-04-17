import axios from "axios";
import { User } from "../models/userModel.js";

export const getFriendsStandings = async (req, res) => {
  try {
    const { handle, contestId } = req.query;

    // 1️⃣ Find user (optional)
    let user = await User.findOne({ codeforcesHandle: handle });

    const friends = user ? user.friends : [];

    // 2️⃣ Include user + friends
    const allHandles = [handle, ...friends];

    let leaderboard = [];

    // 3️⃣ Fetch data using user.status API
    for (const h of allHandles) {
      try {
        const url = `https://codeforces.com/api/user.status?handle=${h}`;

        const response = await axios.get(url);

        if (response.data.status === "OK") {
          const submissions = response.data.result;

          const solvedProblems = new Set();

          for (const sub of submissions) {
            if (
              sub.verdict === "OK" &&
              sub.contestId == contestId
            ) {
              solvedProblems.add(sub.problem.index);
            }
          }

          leaderboard.push({
            handle: h,
            solved: solvedProblems.size,
            participated: solvedProblems.size > 0,
          });
        }

      } catch (err) {
        console.log(`Skipping: ${h}`);
      }
    }

    // 4️⃣ Sort by solved
    leaderboard.sort((a, b) => b.solved - a.solved);

    res.json({ leaderboard });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};