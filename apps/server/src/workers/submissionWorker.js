import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { pushToGithub } from "../services/githubService.js";

const worker = new Worker(
  "submissionQueue",
  async (job) => {
    console.log("Processing job:", job.data);

    const { problemName, code } = job.data;

    // 🔥 Push to GitHub
    await pushToGithub({
        problemName,
        code,
        language: job.data.language,
        contestId: job.data.contestId,
    });
  },
  {
    connection: redisConnection,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});