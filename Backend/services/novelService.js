const novelModel = require('../models/novelModel');

const VALID_GENRES = ['Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'];
const VALID_STATUSES = ['Devam Ediyor', 'Tamamlandı', 'Askıya Alındı'];

const createNovel = async (user_id, title, author, description, genre, status) => {
  if (!title || !author) throw new Error('Başlık ve yazar zorunludur');
  if (genre && !VALID_GENRES.includes(genre)) throw new Error('Geçersiz tür');
  if (status && !VALID_STATUSES.includes(status)) throw new Error('Geçersiz durum');

  return await novelModel.createNovel(user_id, title, author, description, genre, status || 'Devam Ediyor');
};

const getAllNovels = async (genre, status, search) => {
  return await novelModel.getAllNovels(genre, status, search);
};

const getNovelById = async (id) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  return novel;
};

const updateNovel = async (id, user_id, title, author, description, genre, status) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  if (novel.user_id !== user_id) throw new Error('Bu noveli düzenleme yetkiniz yok');
  if (!title || !author) throw new Error('Başlık ve yazar zorunludur');
  if (genre && !VALID_GENRES.includes(genre)) throw new Error('Geçersiz tür');
  if (status && !VALID_STATUSES.includes(status)) throw new Error('Geçersiz durum');

  return await novelModel.updateNovel(id, title, author, description, genre, status);
};

const deleteNovel = async (id, user_id) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  if (novel.user_id !== user_id) throw new Error('Bu noveli silme yetkiniz yok');

  await novelModel.deleteNovel(id);
};

module.exports = { createNovel, getAllNovels, getNovelById, updateNovel, deleteNovel };