const pool = require('../config/db');

const createChapter = async (novel_id, chapter_number, title, content) => {
  const result = await pool.query(
    'INSERT INTO chapters (novel_id, chapter_number, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
    [novel_id, chapter_number, title, content]
  );
  return result.rows[0];
};

const getChaptersByNovelId = async (novel_id) => {
  const result = await pool.query(
    'SELECT id, novel_id, chapter_number, title, created_at FROM chapters WHERE novel_id = $1 ORDER BY chapter_number ASC',
    [novel_id]
  );
  return result.rows;
};

const getChapterById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM chapters WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const getChapterByNumber = async (novel_id, chapter_number) => {
  const result = await pool.query(
    'SELECT * FROM chapters WHERE novel_id = $1 AND chapter_number = $2',
    [novel_id, chapter_number]
  );
  return result.rows[0];
};

const updateChapter = async (id, title, content) => {
  const result = await pool.query(
    'UPDATE chapters SET title=$1, content=$2 WHERE id=$3 RETURNING *',
    [title, content, id]
  );
  return result.rows[0];
};

const deleteChapter = async (id) => {
  await pool.query('DELETE FROM chapters WHERE id = $1', [id]);
};

module.exports = { createChapter, getChaptersByNovelId, getChapterById, getChapterByNumber, updateChapter, deleteChapter };