import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import env from "env";

import router from "./routes/v1/index";

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: env.jwksUri,
  }),

  audience: env.audience,
  issuer: [env.issuer],
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

// APIサーバ起動
app.listen(env.appPort);
console.log("Express WebApi listening on port " + env.appPort);
