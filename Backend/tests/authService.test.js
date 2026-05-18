const authService = require('../services/authService');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

jest.mock('../models/userModel');
jest.mock('bcrypt');

describe('authService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {

    test('başarılı kayıt', async () => {
      userModel.findUserByUsername.mockResolvedValue(null);
      userModel.findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      userModel.createUser.mockResolvedValue({
        id: 1, username: 'furkan', email: 'furkan@test.com', role: 'author'
      });

      const result = await authService.register('furkan', 'furkan@test.com', '123456', 'author');

      expect(result.username).toBe('furkan');
      expect(result.role).toBe('author');
    });

    test('kullanıcı adı zaten varsa hata fırlatır', async () => {
      userModel.findUserByUsername.mockResolvedValue({ id: 1 });

      await expect(
        authService.register('furkan', 'furkan@test.com', '123456', 'author')
      ).rejects.toThrow('Bu kullanıcı adı zaten kullanılıyor');
    });

    test('email zaten varsa hata fırlatır', async () => {
      userModel.findUserByUsername.mockResolvedValue(null);
      userModel.findUserByEmail.mockResolvedValue({ id: 1 });

      await expect(
        authService.register('furkan', 'furkan@test.com', '123456', 'author')
      ).rejects.toThrow('Bu email zaten kullanılıyor');
    });

    test('geçersiz rol varsa hata fırlatır', async () => {
      userModel.findUserByUsername.mockResolvedValue(null);
      userModel.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.register('furkan', 'furkan@test.com', '123456', 'admin')
      ).rejects.toThrow('Geçersiz rol');
    });

  });

  describe('login', () => {

    test('başarılı giriş token döner', async () => {
      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        username: 'furkan',
        email: 'furkan@test.com',
        role: 'author',
        password_hash: 'hashedpassword'
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login('furkan@test.com', '123456');

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('furkan');
    });

    test('kullanıcı bulunamazsa hata fırlatır', async () => {
      userModel.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login('yok@test.com', '123456')
      ).rejects.toThrow('Email veya şifre hatalı');
    });

    test('şifre yanlışsa hata fırlatır', async () => {
      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        password_hash: 'hashedpassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login('furkan@test.com', 'yanlis')
      ).rejects.toThrow('Email veya şifre hatalı');
    });

  });

});