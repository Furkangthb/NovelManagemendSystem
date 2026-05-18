const chapterService = require('../services/chapterService');
const chapterModel = require('../models/chapterModel');
const novelModel = require('../models/novelModel');

jest.mock('../models/chapterModel');
jest.mock('../models/novelModel');

describe('chapterService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChapter', () => {

    test('başarılı bölüm oluşturma', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 1 });
      chapterModel.getChapterByNumber.mockResolvedValue(null);
      chapterModel.createChapter.mockResolvedValue({
        id: 1, novel_id: 1, chapter_number: 1,
        title: 'Başlangıç', content: 'İçerik...'
      });

      const result = await chapterService.createChapter(1, 1, 1, 'Başlangıç', 'İçerik...');
      expect(result.title).toBe('Başlangıç');
    });

    test('içerik boşsa hata fırlatır', async () => {
      await expect(
        chapterService.createChapter(1, 1, 1, 'Başlangıç', '')
      ).rejects.toThrow('Bölüm numarası, başlık ve içerik zorunludur');
    });

    test('novel bulunamazsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue(null);

      await expect(
        chapterService.createChapter(999, 1, 1, 'Başlangıç', 'İçerik...')
      ).rejects.toThrow('Novel bulunamadı');
    });

    test('yetkisiz kullanıcı bölüm ekleyemez', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(
        chapterService.createChapter(1, 1, 1, 'Başlangıç', 'İçerik...')
      ).rejects.toThrow('Bu novele bölüm ekleme yetkiniz yok');
    });

    test('aynı bölüm numarası varsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 1 });
      chapterModel.getChapterByNumber.mockResolvedValue({ id: 1 });

      await expect(
        chapterService.createChapter(1, 1, 1, 'Başlangıç', 'İçerik...')
      ).rejects.toThrow('Bu bölüm numarası zaten mevcut');
    });

  });

  describe('deleteChapter', () => {

    test('bölüm bulunamazsa hata fırlatır', async () => {
      chapterModel.getChapterById.mockResolvedValue(null);

      await expect(
        chapterService.deleteChapter(999, 1)
      ).rejects.toThrow('Bölüm bulunamadı');
    });

    test('yetkisiz kullanıcı silemez', async () => {
      chapterModel.getChapterById.mockResolvedValue({ id: 1, novel_id: 1 });
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(
        chapterService.deleteChapter(1, 1)
      ).rejects.toThrow('Bu bölümü silme yetkiniz yok');
    });

  });

});