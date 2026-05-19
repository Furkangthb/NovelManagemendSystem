const pool = require('../config/db');

const createNovel = async (user_id, title, author, description, genres, status) => {
  const result = await pool.query(
    'INSERT INTO novels (user_id, title, author, description, genres, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, title, author, description, genres, status]
  );
  return result.rows[0];
};

const getAllNovels = async (genre, status, search, rating) => {
  let query = `
    SELECT n.*, ROUND(COALESCE(AVG(c.rating), 0), 1) as average_rating 
    FROM novels n
    LEFT JOIN comments c ON n.id = c.novel_id
    WHERE 1=1
  `;
  const params = [];

  if (genre) {
    params.push(`%${genre}%`);
    query += ` AND n.genres::text ILIKE $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND n.status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (n.title ILIKE $${params.length} OR n.author ILIKE $${params.length})`;
  }

  query += ` GROUP BY n.id`;

  if (rating) {
    params.push(parseFloat(rating));
    query += ` HAVING COALESCE(AVG(c.rating), 0) >= $${params.length}`;
  }

  query += ' ORDER BY n.created_at DESC';
  
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

const updateNovel = async (id, title, author, description, genres, status) => {
  const result = await pool.query(
    'UPDATE novels SET title=$1, author=$2, description=$3, genres=$4, status=$5 WHERE id=$6 RETURNING *',
    [title, author, description, genres, status, id]
  );
  return result.rows[0];
};

const deleteNovel = async (id) => {
  await pool.query('DELETE FROM novels WHERE id = $1', [id]);
};

module.exports = { createNovel, getAllNovels, getNovelById, updateNovel, deleteNovel };