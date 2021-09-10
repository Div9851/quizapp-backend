import Redis from "ioredis";
import env from "env";

const connect = () => {
  const redis = new Redis({
    host: env.redisHost,
    port: env.redisPort,
  });
  redis.on("error", (err) => {
    console.error(err);
  });
  return redis;
};

export { connect };
