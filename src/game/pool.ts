import { io } from "server";
import { startGame } from "./controller";
import { connect, sharedConnection } from "db/redis";

const join = async (socketId: string, userId: string) => {
  await sharedConnection.hset(`socket:${socketId}`, "user-id", userId);
  const numberOfPlayers = await sharedConnection.scard("pool");
  if (numberOfPlayers === 0) {
    sharedConnection.sadd("pool", socketId);
    return;
  }
  const opponentSocketId = await sharedConnection.spop("pool");
  if (opponentSocketId === null) {
    console.error("opponentSocketId === null");
    return;
  }
  const opponentUserId = await sharedConnection.hget(
    `socket:${socketId}`,
    "user-id"
  );
  if (opponentUserId === null) {
    console.error("opponentUserId === null");
    return;
  }
  io.in(socketId).emit("match", opponentUserId);
  io.in(opponentSocketId).emit("match", userId);
  startGame(socketId, opponentSocketId);
};

const leave = async (socketId: string) => {
  await sharedConnection.srem(`pool`, socketId);
  await sharedConnection.hset(`socket:${socketId}`, "disconnect", "1");
};

export { join, leave };
