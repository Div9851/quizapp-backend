import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

import router from "./routes/v1/index";

dotenv.config();

const jwksUri = process.env.JWKS_URI || "";
const audience = process.env.AUDIENCE || "";
const issuer = process.env.ISSUER || "";

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: jwksUri,
  }),

  audience: audience,
  issuer: [issuer],
  algorithms: ["RS256"],
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkJwt);

// ルーティング
app.use("/v1", router);

const port = process.env.PORT || 8000;

// APIサーバ起動
app.listen(port);
console.log("Express WebApi listening on port " + port);
