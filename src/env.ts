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
}

dotenv.config();

const appPort = parseInt(process.env.APP_PORT || "8000");
const jwksUri = process.env.JWKS_URI || "";
const audience = process.env.AUDIENCE || "";
const issuer = process.env.ISSUER || "";
const pgUser = process.env.PG_USER || "";
const pgPassword = process.env.PG_PASSWORD || "";
const pgHost = process.env.PG_HOST || "";
const pgPort = parseInt(process.env.PG_PORT || "5432");
const pgDatabase = process.env.PG_DB || "";

const env: Env = {
  appPort: appPort,
  jwksUri: jwksUri,
  audience: audience,
  issuer: issuer,
  pgUser: pgUser,
  pgPassword: pgPassword,
  pgHost: pgHost,
  pgPort: pgPort,
  pgDatabase: pgDatabase,
};

export default env;
