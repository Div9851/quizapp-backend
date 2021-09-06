import express from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import * as roomsModel from "models/rooms";

const router = express.Router();

router.post("/", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.sub;
  (async () => {
    const roomId = await roomsModel.create(userId);
    res.status(StatusCodes.OK).json({ id: roomId });
  })().catch((err) => {
    console.error(err);
    setImmediate(() => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });
    });
  });
});

router.get("/:id/members", (req: express.Request, res: express.Response) => {
  (async () => {
    const { rows } = await roomsModel.getMembers(req.params.id);
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

router.post("/:id/members", (req: express.Request, res: express.Response) => {
  const token: any = req.user;
  const userId = token.sub;
  const roomId = req.params.id;
  (async () => {
    await roomsModel.join(roomId, userId);
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
