import * as dotenv from "dotenv";

interface Env {
  port: number;
  jwksUri: string;
  audience: string;
  issuer: string;
  databaseUrl: string;
  redisUrl: string;
  corsOrigin: string;
  noSSL: string;
}

dotenv.config();

const env: Env = {
  port: parseInt(process.env.PORT || "8000"),
  jwksUri: process.env.JWKS_URI || "",
  audience: process.env.AUDIENCE || "",
  issuer: process.env.ISSUER || "",
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  corsOrigin: process.env.CORS_ORIGIN || "",
  noSSL: process.env.NO_SSL || "0",
};

export default env;
