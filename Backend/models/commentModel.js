const pool = require('../config/db');

const createComment = async (novel_id, user_id, text, rating) => {
  const result = await pool.query(
    'INSERT INTO comments (novel_id, user_id, text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
    [novel_id, user_id, text, rating]
  );
  return result.rows[0];
};

const getCommentsByNovelId = async (novel_id) => {
  const result = await pool.query(
    `SELECT comments.*, users.username 
     FROM comments 
     JOIN users ON comments.user_id = users.id 
     WHERE comments.novel_id = $1 
     ORDER BY comments.created_at DESC`,
    [novel_id]
  );
  return result.rows;
};

const getCommentById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const getCommentByUserAndNovel = async (user_id, novel_id) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE user_id = $1 AND novel_id = $2',
    [user_id, novel_id]
  );
  return result.rows[0];
};

const deleteComment = async (id) => {
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
};

module.exports = { createComment, getCommentsByNovelId, getCommentById, getCommentByUserAndNovel, deleteComment };