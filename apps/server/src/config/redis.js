import IORedis from "ioredis";

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,

  //  REQUIRED for BullMQ
  maxRetriesPerRequest: null,
});
