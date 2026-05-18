const commentModel = require('../models/commentModel');
const novelModel = require('../models/novelModel');

const createComment = async (novel_id, user_id, text, rating) => {
  if (!text) throw new Error('Yorum metni zorunludur');
  if (rating === null || rating === undefined) throw new Error('Puan zorunludur');
  if (rating < 1 || rating > 5) throw new Error('Puan 1 ile 5 arasında olmalıdır');
  const novel = await novelModel.getNovelById(novel_id);
  if (!novel) throw new Error('Novel bulunamadı');

  const existing = await commentModel.getCommentByUserAndNovel(user_id, novel_id);
  if (existing) throw new Error('Bu novele zaten yorum yaptınız');

  return await commentModel.createComment(novel_id, user_id, text, rating);
};

const getCommentsByNovelId = async (novel_id) => {
  const novel = await novelModel.getNovelById(novel_id);
  if (!novel) throw new Error('Novel bulunamadı');
  return await commentModel.getCommentsByNovelId(novel_id);
};

const deleteComment = async (id, user_id) => {
  const comment = await commentModel.getCommentById(id);
  if (!comment) throw new Error('Yorum bulunamadı');
  if (comment.user_id !== user_id) throw new Error('Bu yorumu silme yetkiniz yok');
  await commentModel.deleteComment(id);
};

module.exports = { createComment, getCommentsByNovelId, deleteComment };