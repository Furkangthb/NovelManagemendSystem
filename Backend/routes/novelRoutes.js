const express = require('express');
const router = express.Router();
const novelController = require('../controllers/novelController');
const chapterController = require('../controllers/chapterController');
const { authMiddleware, authorMiddleware } = require('../middlewares/auth');


router.get('/', novelController.getAllNovels);
router.get('/:id', novelController.getNovelById);
router.post('/', authMiddleware, authorMiddleware, novelController.createNovel);
router.put('/:id', authMiddleware, authorMiddleware, novelController.updateNovel);
router.delete('/:id', authMiddleware, authorMiddleware, novelController.deleteNovel);


router.get('/:novelId/chapters', chapterController.getChaptersByNovelId);
router.post('/:novelId/chapters', authMiddleware, authorMiddleware, chapterController.createChapter);

module.exports = router;