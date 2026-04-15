import { submissionQueue } from "../queues/submissionQueue.js";
import { Submission } from "../models/submissionModel.js";

export const createSubmission = async (req, res) => {
  try {
    const { userId, problemName, code } = req.body;

    // ✅ 1. Save to MongoDB
    const submission = await Submission.create({
      userId,
      problemName,
      code,
    });

    // ✅ 2. Add job to queue
    await submissionQueue.add("newSubmission", {
        submissionId: submission._id,
        userId,
        problemName,
        code,
        language: req.body.language,
        contestId: req.body.contestId,
    });

    return res.status(201).json({
      message: "Saved + queued 🚀",
      data: submission,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};