import Redis from "ioredis";
import env from "env";

const connect = () => {
  const redis = new Redis(env.redisUrl);
  redis.on("error", (err) => {
    console.error(err);
  });
  return redis;
};

const sharedConnection = connect();

export { connect, sharedConnection };
