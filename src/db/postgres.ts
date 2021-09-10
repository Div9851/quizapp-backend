import { Pool } from "pg";
import env from "env";

const pool: Pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
});

export default pool;
