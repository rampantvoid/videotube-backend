import { Worker } from "bullmq";
import { getRedisConn } from "./redis";
import "dotenv/config";

const main = async () => {
  const redis = getRedisConn();
  const worker = new Worker("main__queue", `${__dirname}/workers/run.js`, {
    connection: redis,
    autorun: false,
    concurrency: 5,
  });

  worker.run();
};

main();
