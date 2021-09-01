import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/v1/index";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルーティング
app.use("/v1", router);

const port = process.env.PORT || 8000;

// APIサーバ起動
app.listen(port);
console.log("Express WebApi listening on port " + port);
