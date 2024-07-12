import { Redis } from "ioredis";

export const getRedisConn = () => {
  return new Redis("your-reddis-uri", {
    maxRetriesPerRequest: null,
  });
};
