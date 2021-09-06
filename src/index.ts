import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import { Server } from "socket.io";
import { authorize } from "@thream/socketio-jwt";
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

const jwksClient = jwksRsa({
  jwksUri: env.jwksUri,
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkJwt);

// ルーティング
app.use("/v1", router);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use(
  authorize({
    algorithms: ["RS256"],
    secret: async (decodedToken) => {
      if (decodedToken === null) {
        return "";
      }
      const key = await jwksClient.getSigningKey(decodedToken.header.kid);
      return key.getPublicKey();
    },
  })
);

io.on("connection", async (socket) => {
  console.log(socket.decodedToken);
  console.log("a user connected");
  socket.emit("hello", "world");
});

// APIサーバ起動
server.listen(env.appPort, () => {
  console.log("Express WebApi listening on port " + env.appPort);
});
