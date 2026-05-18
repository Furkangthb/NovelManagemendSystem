const novelService = require('../services/novelService');

const createNovel = async (req, res) => {
  try {
    const { title, author, description, genre, status } = req.body;
    const novel = await novelService.createNovel(req.user.id, title, author, description, genre, status);
    res.status(201).json({ message: 'Novel oluşturuldu', novel });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllNovels = async (req, res) => {
  try {
    const { genre, status, search } = req.query;
    const novels = await novelService.getAllNovels(genre, status, search);
    res.status(200).json({ novels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNovelById = async (req, res) => {
  try {
    const novel = await novelService.getNovelById(req.params.id);
    res.status(200).json({ novel });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateNovel = async (req, res) => {
  try {
    const { title, author, description, genre, status } = req.body;
    const novel = await novelService.updateNovel(req.params.id, req.user.id, title, author, description, genre, status);
    res.status(200).json({ message: 'Novel güncellendi', novel });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNovel = async (req, res) => {
  try {
    await novelService.deleteNovel(req.params.id, req.user.id);
    res.status(200).json({ message: 'Novel silindi' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createNovel, getAllNovels, getNovelById, updateNovel, deleteNovel };