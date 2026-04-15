import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const submissionQueue = new Queue("submissionQueue", {
  connection: redisConnection,
});