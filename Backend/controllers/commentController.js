const commentService = require('../services/commentService');

const createComment = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const comment = await commentService.createComment(req.params.novelId, req.user.id, text, rating);
    res.status(201).json({ message: 'Yorum eklendi ✅', comment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCommentsByNovelId = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByNovelId(req.params.novelId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id, req.user.id);
    res.status(200).json({ message: 'Yorum silindi ✅' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createComment, getCommentsByNovelId, deleteComment };