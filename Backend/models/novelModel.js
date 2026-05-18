const pool = require('../config/db');

const createNovel = async (user_id, title, author, description, genre, status) => {
  const result = await pool.query(
    'INSERT INTO novels (user_id, title, author, description, genre, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, title, author, description, genre, status]
  );
  return result.rows[0];
};

const getAllNovels = async (genre, status, search) => {
  let query = 'SELECT * FROM novels WHERE 1=1';
  const params = [];

  if (genre) {
    params.push(genre);
    query += ` AND genre = $${params.length}`;
  }
  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length})`;
  }

  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

const getNovelById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM novels WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const updateNovel = async (id, title, author, description, genre, status) => {
  const result = await pool.query(
    'UPDATE novels SET title=$1, author=$2, description=$3, genre=$4, status=$5 WHERE id=$6 RETURNING *',
    [title, author, description, genre, status, id]
  );
  return result.rows[0];
};

const deleteNovel = async (id) => {
  await pool.query('DELETE FROM novels WHERE id = $1', [id]);
};

module.exports = { createNovel, getAllNovels, getNovelById, updateNovel, deleteNovel };