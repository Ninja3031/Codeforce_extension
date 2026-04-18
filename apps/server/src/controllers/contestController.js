import axios from "axios";
import { User } from "../models/userModel.js";

// Utility to fetch ratings natively
const getRatings = async (handles) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handles.join(";")}`);
    if (response.data.status === "OK") {
      const map = {};
      response.data.result.forEach(u => {
        map[u.handle] = {
          rating: u.rating || 0,
          rank: u.rank || "unrated"
        };
      });
      return map;
    }
  } catch (error) {
    console.warn("Could not fetch ratings", error.message);
  }
  return {};
};

export const getFriendsStandings = async (req, res) => {
  try {
    const { handle, contestId } = req.query;

    if (!handle || !contestId) {
      return res.status(400).json({ error: "handle and contestId are required" });
    }

    const user = await User.findOne({ codeforcesHandle: handle });
    const friends = user ? user.friends : [];
    const allHandles = [...new Set([handle, ...friends])];

    // Fetch live ratings natively
    const ratingsMap = await getRatings(allHandles);

    const results = await Promise.allSettled(
      allHandles.map(async (h) => {
        const url = `https://codeforces.com/api/user.status?handle=${h}`;
        const response = await axios.get(url);

        if (response.data.status !== "OK") return null;

        const submissions = response.data.result;
        const solvedProblems = new Set();

        for (const sub of submissions) {
          if (
            sub.verdict === "OK" &&
            String(sub.contestId) === String(contestId)
          ) {
            solvedProblems.add(sub.problem.index);
          }
        }

        const exactSolved = Array.from(solvedProblems).sort();

        return {
          handle: h,
          solved: solvedProblems.size,
          solvedList: exactSolved, /* Exact letters, e.g. ["A", "B"] */
          participated: solvedProblems.size > 0,
          rating: ratingsMap[h]?.rating || 0,
          rank: ratingsMap[h]?.rank || "unrated",
        };
      })
    );

    const leaderboard = results
      .filter(r => r.status === "fulfilled" && r.value)
      .map(r => r.value);

    // Sort by solved DESC, then rating DESC
    leaderboard.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;
      return b.rating - a.rating;
    });

    return res.json({ leaderboard });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};