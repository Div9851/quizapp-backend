import pool from "db/postgres";
import { QueryResult } from "pg";

interface IUser {
  id: string;
  name: string;
}

const create = async (user: IUser): Promise<QueryResult<any>> => {
  const query = "INSERT INTO users (id, name) VALUES ($1, $2)";
  return pool.query(query, [user.id, user.name]);
};

const get = async (id: string): Promise<QueryResult<any>> => {
  const query = "SELECT id, name FROM users WHERE id = $1";
  return pool.query(query, [id]);
};

export { IUser, create, get };
