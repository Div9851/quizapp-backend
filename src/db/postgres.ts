import { Pool } from "pg";
import env from "env";

const createPool = () => {
  if (env.noSSL === "1") {
    return new Pool({
      connectionString: env.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }
  return new Pool({
    connectionString: env.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

const pool: Pool = createPool();

export default pool;
