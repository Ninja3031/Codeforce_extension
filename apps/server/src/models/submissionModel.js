import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  problemName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  contestId: Number,
  language: String,
  verdict: String,
}, {
  timestamps: true
});

export const Submission = mongoose.model("Submission", submissionSchema);