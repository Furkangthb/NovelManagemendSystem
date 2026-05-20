const authService = require("../services/authService");

const register = async (req, res) => {
  try {
  const { username, email, password, role } = req.body;

    
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Güvenlik İhlali: Kullanıcı adı en az 3 karakter olmalıdır.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Güvenlik İhlali: Geçersiz e-posta formatı.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Güvenlik İhlali: Şifre en az 6 karakter olmalıdır.' });
    }
    

    const user = await authService.register(username, email, password, role);
    res.status(201).json({ message: "Kayıt başarılı", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre zorunludur" });
    }

    const result = await authService.login(email, password);
    res.status(200).json({ message: "Giriş başarılı", ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login };