const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const { authMiddleware, authorMiddleware } = require('../middlewares/auth');

router.get('/:id', chapterController.getChapterById);
router.put('/:id', authMiddleware, authorMiddleware, chapterController.updateChapter);
router.delete('/:id', authMiddleware, authorMiddleware, chapterController.deleteChapter);

module.exports = router;