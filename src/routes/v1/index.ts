import express from "express";
import usersRouter from "./users";
import roomsRouter from "./rooms";

const router = express.Router();

// v1以下のルーティング
router.use("/users", usersRouter);
router.use("/rooms", roomsRouter);

export default router;
