import pool from "db/postgres";
import { QueryResult } from "pg";

interface IUser {
  id: string;
  name: string;
}

const create = (user: IUser) => {
  const query = "INSERT INTO users (id, name) VALUES ($1, $2)";
  return pool.query(query, [user.id, user.name]);
};

const update = (user: IUser) => {
  const query = "UPDATE users SET name = $2 WHERE id = $1";
  return pool.query(query, [user.id, user.name]);
};

const get = (id: string) => {
  const query = "SELECT id, name FROM users WHERE id = $1";
  return pool.query(query, [id]);
};

export { IUser, create, update, get };
