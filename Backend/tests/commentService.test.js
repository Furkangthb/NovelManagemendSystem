const commentService = require('../services/commentService');
const commentModel = require('../models/commentModel');
const novelModel = require('../models/novelModel');

jest.mock('../models/commentModel');
jest.mock('../models/novelModel');

describe('commentService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {

    test('başarılı yorum ekleme', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1 });
      commentModel.getCommentByUserAndNovel.mockResolvedValue(null);
      commentModel.createComment.mockResolvedValue({
        id: 1, novel_id: 1, user_id: 1, text: 'Harika!', rating: 5
      });

      const result = await commentService.createComment(1, 1, 'Harika!', 5);
      expect(result.text).toBe('Harika!');
      expect(result.rating).toBe(5);
    });

    test('yorum metni boşsa hata fırlatır', async () => {
      await expect(
        commentService.createComment(1, 1, '', 5)
      ).rejects.toThrow('Yorum metni zorunludur');
    });

    test('puan boşsa hata fırlatır', async () => {
      await expect(
        commentService.createComment(1, 1, 'Harika!', null)
      ).rejects.toThrow('Puan zorunludur');
    });

    test('puan 1den küçükse hata fırlatır', async () => {
      await expect(
        commentService.createComment(1, 1, 'Harika!', 0)
      ).rejects.toThrow('Puan 1 ile 5 arasında olmalıdır');
    });

    test('puan 5den büyükse hata fırlatır', async () => {
      await expect(
        commentService.createComment(1, 1, 'Harika!', 6)
      ).rejects.toThrow('Puan 1 ile 5 arasında olmalıdır');
    });

    test('novel bulunamazsa hata fırlatır', async () => {
      novelModel.getNovelById.mockResolvedValue(null);

      await expect(
        commentService.createComment(999, 1, 'Harika!', 5)
      ).rejects.toThrow('Novel bulunamadı');
    });

    test('aynı kullanıcı iki kez yorum yapamaz', async () => {
      novelModel.getNovelById.mockResolvedValue({ id: 1 });
      commentModel.getCommentByUserAndNovel.mockResolvedValue({ id: 1 });

      await expect(
        commentService.createComment(1, 1, 'Harika!', 5)
      ).rejects.toThrow('Bu novele zaten yorum yaptınız');
    });

  });

  describe('deleteComment', () => {

    test('yorum bulunamazsa hata fırlatır', async () => {
      commentModel.getCommentById.mockResolvedValue(null);

      await expect(
        commentService.deleteComment(999, 1)
      ).rejects.toThrow('Yorum bulunamadı');
    });

    test('yetkisiz kullanıcı yorumu silemez', async () => {
      commentModel.getCommentById.mockResolvedValue({ id: 1, user_id: 2 });

      await expect(
        commentService.deleteComment(1, 1)
      ).rejects.toThrow('Bu yorumu silme yetkiniz yok');
    });

  });

});