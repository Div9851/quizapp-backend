import express from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import * as usersModel from "models/users";

const router = express.Router();

// GETリクエスト
router.get("/", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.sub;
  (async () => {
    const { rows } = await usersModel.get(userId);
    res.status(StatusCodes.OK).json(rows);
  })().catch((err) => {
    console.error(err);
    setImmediate(() => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
  });
});

router.get("/:id", (req: express.Request, res: express.Response) => {
  const userId = req.params.id;
  (async () => {
    const { rows } = await usersModel.get(userId);
    res.status(StatusCodes.OK).json(rows);
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
  const userId = token.sub;
  const userName = req.body.name || "";
  const userPicture = req.body.picture || "";
  const user: usersModel.IUser = {
    id: userId,
    name: userName,
    picture: userPicture,
  };
  (async () => {
    await usersModel.create(user);
    res.status(StatusCodes.OK).json({});
  })().catch((err) => {
    console.error(err);
    setImmediate(() => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
  });
});

// PUTリクエスト

router.put("/", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.sub;
  const userName = req.body.name || "";
  const userPicture = req.body.picture || "";
  const user: usersModel.IUser = {
    id: userId,
    name: userName,
    picture: userPicture,
  };
  (async () => {
    await usersModel.update(user);
    res.status(StatusCodes.OK).json({});
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
