const novelService = require('../services/novelService');
const novelModel = require('../models/novelModel');

jest.mock('../models/novelModel');

describe('novelService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNovel', () => {

    test('başarılı novel oluşturma', async () => {
      novelModel.createNovel.mockResolvedValue({
        id: 1, user_id: 1, title: 'Solo Leveling',
        author: 'Chugong', genre: 'Fantastik', status: 'Devam Ediyor'
      });

      const result = await novelService.createNovel(1, 'Solo Leveling', 'Chugong', 'Açıklama', 'Fantastik', 'Devam Ediyor');
      expect(result.title).toBe('Solo Leveling');
    });

    test('başlık boşsa hata fırlatır', async () => {
      await expect(
        novelService.createNovel(1, '', 'Chugong', 'Açıklama', 'Fantastik', 'Devam Ediyor')
      ).rejects.toThrow('Başlık ve yazar zorunludur');
    });

    test('yazar boşsa hata fırlatır', async () => {
      await expect(
        novelService.createNovel(1, 'Solo Leveling', '', 'Açıklama', 'Fantastik', 'Devam Ediyor')
      ).rejects.toThrow('Başlık ve yazar zorunludur');
    });

    test('geçersiz tür varsa hata fırlatır', async () => {
      await expect(
        novelService.createNovel(1, 'Solo Leveling', 'Chugong', 'Açıklama', 'GeçersizTür', 'Devam Ediyor')
      ).rejects.toThrow('Geçersiz tür');
    });

    test('geçersiz durum varsa hata fırlatır', async () => {
      await expect(
        novelService.createNovel(1, 'Solo Leveling', 'Chugong', 'Açıklama', 'Fantastik', 'GeçersizDurum')
      ).rejects.toThrow('Geçersiz durum');
    });

  });

  describe('getNovelById', () => {

    test('novel bulunamazsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue(null);

      await expect(
        novelService.getNovelById(999)
      ).rejects.toThrow('Novel bulunamadı');
    });

    test('başarılı novel getirme', async () => {
      novelModel.getNovelById.mockResolvedValue({
        id: 1, title: 'Solo Leveling'
      });

      const result = await novelService.getNovelById(1);
      expect(result.title).toBe('Solo Leveling');
    });

  });

  describe('updateNovel', () => {

    test('novel bulunamazsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue(null);

      await expect(
        novelService.updateNovel(999, 1, 'Başlık', 'Yazar', 'Açıklama', 'Fantastik', 'Devam Ediyor')
      ).rejects.toThrow('Novel bulunamadı');
    });

    test('yetkisiz kullanıcı güncelleyemez', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(
        novelService.updateNovel(1, 1, 'Başlık', 'Yazar', 'Açıklama', 'Fantastik', 'Devam Ediyor')
      ).rejects.toThrow('Bu noveli düzenleme yetkiniz yok');
    });

  });

  describe('deleteNovel', () => {

    test('novel bulunamazsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue(null);

      await expect(
        novelService.deleteNovel(999, 1)
      ).rejects.toThrow('Novel bulunamadı');
    });

    test('yetkisiz kullanıcı silemez', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(
        novelService.deleteNovel(1, 1)
      ).rejects.toThrow('Bu noveli silme yetkiniz yok');
    });

  });

});