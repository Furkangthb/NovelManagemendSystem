const chapterService = require('../services/chapterService');

const createChapter = async (req, res) => {
  try {
    const { chapter_number, title, content } = req.body;
    const chapter = await chapterService.createChapter(req.params.novelId, req.user.id, chapter_number, title, content);
    res.status(201).json({ message: 'Bölüm oluşturuldu ✅', chapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getChaptersByNovelId = async (req, res) => {
  try {
    const chapters = await chapterService.getChaptersByNovelId(req.params.novelId);
    res.status(200).json({ chapters });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getChapterById = async (req, res) => {
  try {
    const chapter = await chapterService.getChapterById(req.params.id);
    res.status(200).json({ chapter });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const chapter = await chapterService.updateChapter(req.params.id, req.user.id, title, content);
    res.status(200).json({ message: 'Bölüm güncellendi ✅', chapter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteChapter = async (req, res) => {
  try {
    await chapterService.deleteChapter(req.params.id, req.user.id);
    res.status(200).json({ message: 'Bölüm silindi ✅' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createChapter, getChaptersByNovelId, getChapterById, updateChapter, deleteChapter };