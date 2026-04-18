import { submissionQueue } from "../queues/submissionQueue.js";
import { Submission } from "../models/submissionModel.js";

export const createSubmission = async (req, res) => {
  try {
    const { userId, problemName, code, verdict, language, contestId } = req.body;

    if (!userId || !problemName || !code) {
      return res.status(400).json({ error: "Missing required fields: userId, problemName, and code are required." });
    }

    const safeLanguage = language || "unknown";
    const safeContestId = contestId || null;

    //  . Save all attempts to MongoDB
    const submission = await Submission.create({
      userId,
      problemName,
      code,
      verdict,
      language: safeLanguage,
      contestId: safeContestId,
    });

    //  . Only Add "Accepted" jobs to GitHub queue
    const normalizedVerdict = String(verdict || "").toLowerCase();
    const isAccepted = normalizedVerdict === "ok" || normalizedVerdict === "accepted";
    
    if (isAccepted) {
      await submissionQueue.add("newSubmission", {
          submissionId: submission._id,
          userId,
          problemName,
          code,
          language,
          contestId,
      });
    }

    return res.status(201).json({
      message: isAccepted ? "Saved to DB + Queued for GitHub " : "Saved to DB (Not pushing, not AC)",
      data: submission,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};