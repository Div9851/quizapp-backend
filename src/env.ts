import * as dotenv from "dotenv";

interface Env {
  appPort: number;
  jwksUri: string;
  audience: string;
  issuer: string;
  pgUser: string;
  pgPassword: string;
  pgHost: string;
  pgPort: number;
  pgDatabase: string;
  redisHost: string;
  redisPort: number;
  corsOrigin: string;
}

dotenv.config();

const env: Env = {
  appPort: parseInt(process.env.APP_PORT || "8000"),
  jwksUri: process.env.JWKS_URI || "",
  audience: process.env.AUDIENCE || "",
  issuer: process.env.ISSUER || "",
  pgUser: process.env.PG_USER || "",
  pgPassword: process.env.PG_PASSWORD || "",
  pgHost: process.env.PG_HOST || "localhost",
  pgPort: parseInt(process.env.PG_PORT || "5432"),
  pgDatabase: process.env.PG_DB || "",
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379"),
  corsOrigin: process.env.CORS_ORIGIN || "",
};

export default env;
