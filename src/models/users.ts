import pool from "db/postgres";

interface IUser {
  id: string;
  name: string;
  picture: string;
}

const create = (user: IUser) => {
  const query = "INSERT INTO users (id, name, picture) VALUES ($1, $2, $3)";
  return pool.query(query, [user.id, user.name, user.picture]);
};

const update = (user: IUser) => {
  const query = "UPDATE users SET name = $2, picture = $3 WHERE id = $1";
  return pool.query(query, [user.id, user.name, user.picture]);
};

const get = (id: string) => {
  const query = "SELECT id, name, picture FROM users WHERE id = $1";
  return pool.query(query, [id]);
};

export { IUser, create, update, get };
