import { io } from "server";
import { startGame } from "./controller";
import { connect } from "db/redis";

const join = async (socketId: string, userId: string) => {
  const redis = connect();
  await redis.hset(`socket:${socketId}`, "user-id", userId);
  const numberOfPlayers = await redis.scard("pool");
  if (numberOfPlayers === 0) {
    redis.sadd("pool", socketId);
    return;
  }
  const opponentSocketId = await redis.spop("pool");
  if (opponentSocketId === null) {
    console.error("opponentSocketId === null");
    return;
  }
  const opponentUserId = await redis.hget(`socket:${socketId}`, "user-id");
  if (opponentUserId === null) {
    console.error("opponentUserId === null");
    return;
  }
  io.in(socketId).emit("match", opponentUserId);
  io.in(opponentSocketId).emit("match", userId);
  startGame(redis, socketId, opponentSocketId);
};

const leave = async (socketId: string) => {
  const redis = connect();
  await redis.srem(`pool`, socketId);
  await redis.hset(`socket:${socketId}`, "disconnect", "1");
};

export { join, leave };
