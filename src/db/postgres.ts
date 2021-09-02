import { Pool } from "pg";
import env from "env";

const pool: Pool = new Pool({
  user: env.pgUser,
  host: env.pgHost,
  database: env.pgDatabase,
  password: env.pgPassword,
  port: env.pgPort,
  max: 20,
  idleTimeoutMillis: 30000,
});

export default pool;
