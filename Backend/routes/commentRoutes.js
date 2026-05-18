const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/:novelId/comments', commentController.getCommentsByNovelId);
router.post('/:novelId/comments', authMiddleware, commentController.createComment);
router.delete('/comments/:id', authMiddleware, commentController.deleteComment);

module.exports = router;