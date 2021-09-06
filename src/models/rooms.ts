import crypto from "crypto";
import pool from "db/postgres";

interface IRoom {
  id: string;
  ownerId: string;
}

const generateRoomId = (ownerId: string, createdAt: Date) => {
  const base = `ownerId:${ownerId} createdAt:${createdAt}`;
  const roomId = crypto.createHash("md5").update(base).digest("hex").toString();
  return roomId;
};

const create = async (ownerId: string) => {
  const roomId = generateRoomId(ownerId, new Date());
  const query = `INSERT INTO rooms (id, owner_id) VALUES ($1, $2)`;
  await pool.query(query, [roomId, ownerId]);
  await join(roomId, ownerId);
  return roomId;
};

const getMembers = async (roomId: string) => {
  const query = `SELECT id, name FROM users
  JOIN room_users ON users.id = room_users.user_id
  WHERE room_id = $1`;
  return pool.query(query, [roomId]);
};

const join = (roomId: string, userId: string) => {
  const query = `INSERT INTO room_users (room_id, user_id) VALUES ($1, $2)`;
  return pool.query(query, [roomId, userId]);
};

export { IRoom, create, getMembers, join };
