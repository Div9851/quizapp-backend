import express from "express";
import pool from "db/postgres";

const router = express.Router();

// GETリクエスト
router.get("/", (req: express.Request, res: express.Response) => {
  const query = "SELECT id, name FROM users WHERE id = $1";
  const user: any = req.user;
  // const userId = user.iss + "#" + user.sub;
  const userId = "hoge";
  (async () => {
    const { rows } = await pool.query(query, [userId]);
    console.log("user:", rows[0]);
    res.status(200).json({ id: rows[0].id, name: rows[0].name });
  })().catch((err) => {
    setImmediate(() => {
      res.status(400).json({ message: err });
    });
  });
});

// POSTリクエスト
router.post("/", (req: express.Request, res: express.Response) => {
  const query = "INSERT (id, name) INTO users VALUES ($1, $2)";
  const user: any = req.user;
  const userId = user.iss + "#" + user.sub;
  const userName = "testuser";
  (async () => {
    const { rows } = await pool.query(query, [userId, userName]);
    res.status(200).json({ id: userId, name: userName });
  })().catch((err) => {
    setImmediate(() => {
      res.status(400).json({ message: err });
    });
  });
});

export default router;
