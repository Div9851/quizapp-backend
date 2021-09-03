import express from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import * as usersModel from "models/users";

const router = express.Router();

// GETリクエスト
router.get("/", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.iss + "#" + token.sub;
  (async () => {
    const { rows } = await usersModel.get(userId);
    if (rows.length == 0) {
      throw new Error(`user '${userId}' not found`);
    }
    res.status(StatusCodes.OK).json({ id: rows[0].id, name: rows[0].name });
  })().catch((err) => {
    console.error(err);
    setImmediate(() => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
  });
});

// POSTリクエスト
router.post("/", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.iss + "#" + token.sub;
  const userName = req.body.name || "";
  const user: usersModel.IUser = {
    id: userId,
    name: userName,
  };
  (async () => {
    await usersModel.create(user);
    res.status(StatusCodes.CREATED).json(user);
  })().catch((err) => {
    console.error(err);
    setImmediate(() => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
  });
});

export default router;
