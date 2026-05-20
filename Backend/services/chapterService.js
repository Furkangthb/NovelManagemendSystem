const chapterModel = require('../models/chapterModel');
const novelModel = require('../models/novelModel');

const createChapter = async (novel_id, user_id, chapter_number, title, content) => {
  if (!chapter_number || !title || title.trim().length === 0 || !content || content.trim().length === 0) {
  throw new Error('Bölüm numarası, başlık ve içerik zorunludur ve sadece boşluktan oluşamaz');
}
  
  if (chapter_number < 1) throw new Error('Bölüm numarası 1 veya daha büyük olmalıdır');
  if (chapter_number > 9999) throw new Error('Bölüm numarası 9999\'dan büyük olamaz');

  const novel = await novelModel.getNovelById(novel_id);
  if (!novel) throw new Error('Novel bulunamadı');
  if (novel.user_id !== user_id) throw new Error('Bu novele bölüm ekleme yetkiniz yok');

  const existingChapter = await chapterModel.getChapterByNumber(novel_id, chapter_number);
  if (existingChapter) throw new Error('Bu bölüm numarası zaten mevcut');

  return await chapterModel.createChapter(novel_id, chapter_number, title, content);
};
const getChaptersByNovelId = async (novel_id) => {
  const novel = await novelModel.getNovelById(novel_id);
  if (!novel) throw new Error('Novel bulunamadı');
  return await chapterModel.getChaptersByNovelId(novel_id);
};

const getChapterById = async (id) => {
  const chapter = await chapterModel.getChapterById(id);
  if (!chapter) throw new Error('Bölüm bulunamadı');
  return chapter;
};

const updateChapter = async (id, user_id, title, content) => {
  if (!title || title.trim().length === 0 || !content || content.trim().length === 0) {
  throw new Error('Başlık ve içerik zorunludur ve sadece boşluktan oluşamaz');
}

  const chapter = await chapterModel.getChapterById(id);
  if (!chapter) throw new Error('Bölüm bulunamadı');

  const novel = await novelModel.getNovelById(chapter.novel_id);
  if (novel.user_id !== user_id) throw new Error('Bu bölümü güncelleme yetkiniz yok');

  return await chapterModel.updateChapter(id, title, content);
};

const deleteChapter = async (id, user_id) => {
  const chapter = await chapterModel.getChapterById(id);
  if (!chapter) throw new Error('Bölüm bulunamadı');

  const novel = await novelModel.getNovelById(chapter.novel_id);
  if (novel.user_id !== user_id) throw new Error('Bu bölümü silme yetkiniz yok');

  await chapterModel.deleteChapter(id);
};

module.exports = { createChapter, getChaptersByNovelId, getChapterById, updateChapter, deleteChapter };