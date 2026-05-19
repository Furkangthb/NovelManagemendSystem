const novelModel = require('../models/novelModel');

const VALID_GENRES = ['Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'];
const VALID_STATUSES = ['Devam Ediyor', 'Tamamlandı', 'Askıya Alındı'];

const createNovel = async (user_id, title, author, description, genres, status) => {
  if (!title || !author) throw new Error('Başlık ve yazar zorunludur');

  if (!genres || genres.length === 0) {
    throw new Error('En az bir tür seçmelisiniz');
  }

  const genresArray = Array.isArray(genres) ? genres : [genres];
  const cleanGenres = genresArray.map(g => typeof g === 'string' ? g.trim() : g);

  const invalidGenres = cleanGenres.filter(g => !VALID_GENRES.includes(g));
  if (invalidGenres.length > 0) {
    throw new Error(`Geçersiz tür hatası. Şunu tanımıyorum: "${invalidGenres.join(', ')}"`);
  }

  if (status && !VALID_STATUSES.includes(status)) throw new Error('Geçersiz durum');

  return await novelModel.createNovel(user_id, title, author, description, cleanGenres, status || 'Devam Ediyor');
};

const getAllNovels = async (genre, status, search) => {
  return await novelModel.getAllNovels(genre, status, search);
};

const getNovelById = async (id) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  return novel;
};

const updateNovel = async (id, user_id, title, author, description, genres, status) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  if (novel.user_id !== user_id) throw new Error('Bu noveli düzenleme yetkiniz yok');

  if (!title || !author) throw new Error('Başlık ve yazar zorunludur');

  if (!genres || genres.length === 0) {
    throw new Error('En az bir tür seçmelisiniz');
  }

  const genresArray = Array.isArray(genres) ? genres : [genres];
  const cleanGenres = genresArray.map(g => typeof g === 'string' ? g.trim() : g);

  const invalidGenres = cleanGenres.filter(g => !VALID_GENRES.includes(g));
  if (invalidGenres.length > 0) {
    throw new Error(`Geçersiz tür hatası. Şunu tanımıyorum: "${invalidGenres.join(', ')}"`);
  }

  if (status && !VALID_STATUSES.includes(status)) throw new Error('Geçersiz durum');

  return await novelModel.updateNovel(id, title, author, description, cleanGenres, status);
};

const deleteNovel = async (id, user_id) => {
  const novel = await novelModel.getNovelById(id);
  if (!novel) throw new Error('Novel bulunamadı');
  if (novel.user_id !== user_id) throw new Error('Bu noveli silme yetkiniz yok');

  await novelModel.deleteNovel(id);
};

module.exports = { createNovel, getAllNovels, getNovelById, updateNovel, deleteNovel };