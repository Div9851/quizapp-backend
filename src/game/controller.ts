import { io } from "server";
import { connect } from "db/redis";
import crypto from "crypto";
import { shuffle } from "pandemonium";
import { Redis } from "ioredis";
import { getAll } from "models/questions";

const StatusValues = {
  Matched: "matched",
  NextQuestion: "next question",
  Thinking: "thinking",
  EndQuestion: "end question",
} as const;

const generateRoomId = (player1: string, player2: string) => {
  const base = `${player1}:${player2}`;
  const roomId = crypto.createHash("md5").update(base).digest("hex").toString();
  return roomId;
};

const startGame = async (redis: Redis, player1: string, player2: string) => {
  const roomId = generateRoomId(player1, player2);
  io.in(player1).socketsJoin(`room:${roomId}`);
  io.in(player2).socketsJoin(`room:${roomId}`);
  await Promise.all([
    redis.hset(`socket:${player1}`, "room-id", roomId),
    redis.hset(`socket:${player2}`, "room-id", roomId),
    redis.hset(`socket:${player1}`, "score", "0"),
    redis.hset(`socket:${player2}`, "score", "0"),
    redis.hset(`room:${roomId}`, "status", StatusValues.Matched),
    redis.hset(`room:${roomId}`, "player1", player1),
    redis.hset(`room:${roomId}`, "player2", player2),
    redis.hset(`room:${roomId}`, "question-number", "0"),
    redis.lpush(`room:${roomId}:token`, "0"),
  ]);
  const { rows } = await getAll();
  const selected = shuffle(rows).slice(0, 30);
  for (const question of selected) {
    await Promise.all([
      redis.rpush(`room:${roomId}:questions:content`, question.content),
      redis.rpush(
        `room:${roomId}:questions:display-answer`,
        question.display_answer
      ),
      redis.rpush(`room:${roomId}:questions:answer`, question.answer),
    ]);
  }
  await checkGameStatus(redis, roomId);
};

const checkGameStatus = async (redis: Redis, roomId: string) => {
  const [player1, player2] = await Promise.all([
    redis.hget(`room:${roomId}`, "player1"),
    redis.hget(`room:${roomId}`, "player2"),
  ]);
  const [scoreStr1, scoreStr2, questionNumberStr] = await Promise.all([
    redis.hget(`socket:${player1}`, "score"),
    redis.hget(`socket:${player2}`, "score"),
    redis.hget(`room:${roomId}`, "question-number"),
  ]);
  if (scoreStr1 === null || scoreStr2 === null || questionNumberStr === null)
    return;
  const score1 = parseInt(scoreStr1);
  const score2 = parseInt(scoreStr2);
  const questionNumber = parseInt(questionNumberStr);
  const ms = 1500;

  if (score1 >= 50) {
    setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player1), ms);
  } else if (score2 >= 50) {
    setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player2), ms);
  } else if (questionNumber >= 30) {
    if (score1 > score2)
      setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player1), ms);
    else if (score1 < score2)
      setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player2), ms);
    else setTimeout(() => io.in(`room:${roomId}`).emit("endGame", ""), ms);
  } else {
    setTimeout(() => nextQuestion(redis, roomId), ms);
  }
};

const nextQuestion = async (redis: Redis, roomId: string) => {
  const [player1, player2] = await Promise.all([
    redis.hget(`room:${roomId}`, "player1"),
    redis.hget(`room:${roomId}`, "player2"),
  ]);
  const [disconnect1, disconnect2] = await Promise.all([
    redis.hget(`socket:${player1}`, "disconnect"),
    redis.hget(`socket:${player2}`, "disconnect"),
  ]);
  if (disconnect1 === "1") {
    setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player2), 1500);
    return;
  } else if (disconnect2 === "1") {
    setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player1), 1500);
    return;
  }
  await Promise.all([
    redis.hset(`room:${roomId}`, "status", StatusValues.NextQuestion),
    redis.hset(`socket:${player1}`, "answered", "0"),
    redis.hset(`socket:${player2}`, "answered", "0"),
    redis.hincrby(`room:${roomId}`, "question-number", 1),
    redis.hset(`room:${roomId}`, "ready", "0"),
    redis.hset(`room:${roomId}`, "timeup", "0"),
    redis.hset(`room:${roomId}`, "incorrect", "0"),
    redis.hdel(`room:${roomId}`, "answering"),
  ]);
  io.in(`room:${roomId}`).emit("next");
};

const readyHandler = async (redis: Redis, roomId: string) => {
  const status = await redis.hget(`room:${roomId}`, "status");
  if (status !== StatusValues.NextQuestion) return;
  const ready = await redis.hincrby(`room:${roomId}`, "ready", 1);
  if (ready >= 2) {
    setTimeout(() => sendQuestion(redis, roomId), 1000);
  }
};

const sendQuestion = async (redis: Redis, roomId: string) => {
  const [content, displayAnswer, answer] = await Promise.all([
    redis.lpop(`room:${roomId}:questions:content`),
    redis.lpop(`room:${roomId}:questions:display-answer`),
    redis.lpop(`room:${roomId}:questions:answer`),
  ]);
  await Promise.all([
    redis.hset(`room:${roomId}`, "status", StatusValues.Thinking),
    redis.hset(`room:${roomId}`, "display-answer", displayAnswer),
    redis.hset(`room:${roomId}`, "answer", answer),
  ]);
  io.in(`room:${roomId}`).emit("question", content);
};

const pushHandler = async (redis: Redis, roomId: string, socketId: string) => {
  const [status, answering, answered] = await Promise.all([
    redis.hget(`room:${roomId}`, "status"),
    redis.hget(`room:${roomId}`, "answering"),
    redis.hget(`socket:${socketId}`, "answered"),
  ]);
  if (status !== StatusValues.Thinking) return;
  if (answering === null && answered === "0") {
    await Promise.all([
      redis.hset(`room:${roomId}`, "answering", socketId),
      redis.hset(`room:${roomId}`, "pos", "0"),
      redis.hset(`socket:${socketId}`, "answered", "1"),
    ]);
    io.in(`room:${roomId}`).emit("answering", socketId);
    await nextChoices(redis, roomId);
  }
};

const generateDummy = (correctChar: string) => {
  const hiragana =
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん" +
    "がぎぐげござじずぜぞだぢづでどばびぶべぼ" +
    "ぱぴぷぺぽ" +
    "ぁぃぅぇぉっゃゅょ";
  const katakana =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
    "ガギグゲゴザジズゼゾダヂヅデドバビブベボ" +
    "パピプペポ" +
    "ァィゥェォッャュョ";
  const upperAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const allChars = hiragana + katakana + lowerAlphabet + upperAlphabet + digits;

  if (hiragana.indexOf(correctChar) !== -1) {
    return shuffle([...hiragana.replace(correctChar, "")]).slice(0, 3);
  } else if (katakana.indexOf(correctChar) !== -1) {
    return shuffle([...katakana.replace(correctChar, "")]).slice(0, 3);
  } else if (upperAlphabet.indexOf(correctChar) !== -1) {
    return shuffle([...upperAlphabet.replace(correctChar, "")]).slice(0, 3);
  } else if (lowerAlphabet.indexOf(correctChar) !== -1) {
    return shuffle([...lowerAlphabet.replace(correctChar, "")]).slice(0, 3);
  } else if (digits.indexOf(correctChar) !== -1) {
    return shuffle([...digits.replace(correctChar, "")]).slice(0, 3);
  }
  return shuffle([...allChars.replace(correctChar, "")]).slice(0, 3);
};

const nextChoices = async (redis: Redis, roomId: string) => {
  const [answering, answer, pos] = await Promise.all([
    redis.hget(`room:${roomId}`, "answering"),
    redis.hget(`room:${roomId}`, "answer"),
    redis.hget(`room:${roomId}`, "pos"),
  ]);
  if (answering === null || answer === null || pos === null) return;
  const correctChar = answer[parseInt(pos)];
  const dummy = generateDummy(correctChar);
  const choices = shuffle(dummy.concat([correctChar]));
  io.in(answering).emit("choices", choices);
};

const answerHandler = async (
  redis: Redis,
  roomId: string,
  socketId: string,
  ...args: any[]
) => {
  const answering = await redis.hget(`room:${roomId}`, "answering");
  if (answering !== socketId) return;
  io.in(`room:${roomId}`).emit("answer", args[0]);
  const [answer, posStr] = await Promise.all([
    redis.hget(`room:${roomId}`, "answer"),
    redis.hget(`room:${roomId}`, "pos"),
  ]);
  if (answer === null || posStr === null) return;
  const pos = parseInt(posStr);
  if (answer[pos] === args[0]) {
    if (pos + 1 === answer.length) {
      await correctAnswer(redis, roomId);
      await endQuestion(redis, roomId);
    } else {
      await redis.hincrby(`room:${roomId}`, "pos", 1);
      await nextChoices(redis, roomId);
    }
  } else {
    await incorrectAnswer(redis, roomId);
    const timeup = await redis.hget(`room:${roomId}`, "timeup");
    if (timeup === "1") await endQuestion(redis, roomId);
  }
};

const correctAnswer = async (redis: Redis, roomId: string) => {
  const answering = await redis.hget(`room:${roomId}`, "answering");
  await redis.hdel(`room:${roomId}`, "answering");
  await redis.hincrby(`socket:${answering}`, "score", 10);
  io.in(`room:${roomId}`).emit("correct", answering);
};

const incorrectAnswer = async (redis: Redis, roomId: string) => {
  const answering = await redis.hget(`room:${roomId}`, "answering");
  await redis.hdel(`room:${roomId}`, "answering");
  const score = await redis.hget(`socket:${answering}`, "score");
  if (score === null) return;
  if (parseInt(score) > 0) {
    await redis.hincrby(`socket:${answering}`, "score", -10);
  }
  io.in(`room:${roomId}`).emit("incorrect", answering);
  const incorrect = await redis.hincrby(`room:${roomId}`, "incorrect", 1);
  if (incorrect >= 2) await endQuestion(redis, roomId);
};

const endQuestion = async (redis: Redis, roomId: string) => {
  await redis.hset(`room:${roomId}`, "status", StatusValues.EndQuestion);
  const answer = await redis.hget(`room:${roomId}`, "display-answer");
  io.in(`room:${roomId}`).emit("endQuestion", answer);
  setTimeout(() => checkGameStatus(redis, roomId), 1000);
};

const timeupHandler = async (redis: Redis, roomId: string) => {
  const [status, answering] = await Promise.all([
    redis.hget(`room:${roomId}`, "status"),
    redis.hget(`room:${roomId}`, "answering"),
  ]);
  if (status !== StatusValues.Thinking) return;
  await redis.hset(`room:${roomId}`, "timeup", "1");
  if (answering === null) await endQuestion(redis, roomId);
};

const disconnectHandler = async (
  redis: Redis,
  roomId: string,
  socketId: string
) => {
  const [status, player1, player2] = await Promise.all([
    redis.hget(`room:${roomId}`, "status"),
    redis.hget(`room:${roomId}`, "player1"),
    redis.hget(`room:${roomId}`, "player2"),
  ]);
  if (status === StatusValues.NextQuestion) {
    if (player1 === socketId)
      setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player2), 1500);
    else
      setTimeout(() => io.in(`room:${roomId}`).emit("endGame", player1), 1500);
  }
};

const anyEventHandler = async (
  socketId: string,
  event: string,
  ...args: any[]
) => {
  const redis = connect();
  const roomId = await redis.hget(`socket:${socketId}`, "room-id");
  if (roomId === null) return;
  await redis.blpop(`room:${roomId}:token`, 0);
  if (event === "ready") {
    await readyHandler(redis, roomId);
  } else if (event === "push") {
    await pushHandler(redis, roomId, socketId);
  } else if (event === "answer") {
    await answerHandler(redis, roomId, socketId, ...args);
  } else if (event === "timeup") {
    await timeupHandler(redis, roomId);
  } else if (event === "disconnecting") {
    await disconnectHandler(redis, roomId, socketId);
  }
  await redis.rpush(`room:${roomId}:token`, "0");
};

export { startGame, anyEventHandler };
