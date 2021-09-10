import pool from "db/postgres";

interface IQuestion {
  id: number;
  content: string;
  displayAnswer: string;
  answer: string;
}

const create = (question: IQuestion) => {
  const query =
    "INSERT INTO questions (content, display_answer, answer) VALUES ($1, $2, $3)";
  return pool.query(query, [
    question.content,
    question.displayAnswer,
    question.answer,
  ]);
};

const update = (question: IQuestion) => {
  const query =
    "UPDATE questions SET content = $2, display_answer = $3, answer = $4 WHERE id = $1";
  return pool.query(query, [
    question.id,
    question.content,
    question.displayAnswer,
    question.answer,
  ]);
};

const get = (id: number) => {
  const query =
    "SELECT id, content, display_answer, answer FROM questions WHERE id = $1";
  return pool.query(query, [id]);
};

const getAll = () => {
  const query = "SELECT id, content, display_answer, answer FROM questions";
  return pool.query(query);
};

export { IQuestion, create, update, get, getAll };
