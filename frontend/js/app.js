const appEl = document.getElementById('main-content');
const navbarEl = document.getElementById('navbar');

const router = {
  navigate: (page, params = {}) => {
    renderNavbar();
    switch (page) {
      case 'home':     homePage.render(params); break;
      case 'novel':    novelPage.render(params); break;
      case 'read':     readPage.render(params); break;
      case 'panel':    panelPage.render(params); break;
      case 'login':    authPage.renderLogin(); break;
      case 'register': authPage.renderRegister(); break;
      default:         homePage.render(params);
    }
  }
};

const renderNavbar = () => {
  const user = auth.getUser();
  navbarEl.innerHTML = `
    <div class="nav-brand" onclick="router.navigate('home')">
      <span class="nav-brand-icon">📖</span>
      <span class="nav-brand-text">NovelHub</span>
    </div>
    <div class="nav-right">
      <div class="nav-search">
        <span class="nav-search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Novel ara..." 
          onkeydown="handleSearch(event)"
          id="search-input"
        >
      </div>
      ${user ? `
        <span style="color: var(--muted); font-size: 0.9rem;">👤 ${user.username}</span>
        ${auth.isAuthor() ? `
          <button class="btn btn-outline" onclick="router.navigate('panel')">Yazar Paneli</button>
        ` : ''}
        <button class="btn btn-danger" onclick="auth.logout()">Çıkış</button>
      ` : `
        <button class="btn btn-outline" onclick="router.navigate('login')">Giriş Yap</button>
        <button class="btn btn-primary" onclick="router.navigate('register')">Kayıt Ol</button>
      `}
    </div>
  `;
};

const handleSearch = (e) => {
  if (e.key === 'Enter') {
    const search = document.getElementById('search-input').value;
    router.navigate('home', { search });
  }
};

const authPage = {
  renderLogin: () => {
    appEl.innerHTML = `
      <div class="auth-page">
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-logo">📖</div>
            <h2 class="auth-title">Tekrar Hoş Geldin</h2>
            <p class="auth-subtitle">Okumaya devam et</p>
          </div>
          <div class="auth-card">
            <div class="form-group">
              <label class="form-label">E-posta</label>
              <input type="email" id="email" class="form-input" placeholder="ornek@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Şifre</label>
              <input type="password" id="password" class="form-input" placeholder="••••••••">
            </div>
            <div id="auth-error" class="error-msg"></div>
            <button class="btn btn-primary btn-full" onclick="authPage.handleLogin()">
              Giriş Yap
            </button>
            <div class="auth-switch">
              Hesabın yok mu? 
              <span onclick="router.navigate('register')">Kayıt Ol</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleLogin: async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('auth-error');

    if (!email || !password) {
      errorDiv.textContent = 'Tüm alanlar zorunludur';
      return;
    }

    try {
      const data = await api.login({ email, password });
      auth.login(data.token, data.user);
      router.navigate('home');
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  renderRegister: () => {
    appEl.innerHTML = `
      <div class="auth-page">
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-logo">📖</div>
            <h2 class="auth-title">Hesap Oluştur</h2>
            <p class="auth-subtitle">Binlerce hikayeye erişim kazan</p>
          </div>
          <div class="auth-card">
            <div class="form-group">
              <label class="form-label">Kullanıcı Adı</label>
              <input type="text" id="username" class="form-input" placeholder="kullanici_adi">
            </div>
            <div class="form-group">
              <label class="form-label">E-posta</label>
              <input type="email" id="email" class="form-input" placeholder="ornek@email.com">
            </div>
            <div class="form-group">
              <label class="form-label">Şifre</label>
              <input type="password" id="password" class="form-input" placeholder="••••••••">
            </div>
            <div class="form-group">
              <label class="form-checkbox">
                <input type="checkbox" id="isAuthor">
                Yazar olarak kayıt ol
              </label>
            </div>
            <div id="auth-error" class="error-msg"></div>
            <button class="btn btn-primary btn-full" onclick="authPage.handleRegister()">
              Kayıt Ol
            </button>
            <div class="auth-switch">
              Zaten hesabın var mı? 
              <span onclick="router.navigate('login')">Giriş Yap</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleRegister: async () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isAuthor = document.getElementById('isAuthor').checked;
    const errorDiv = document.getElementById('auth-error');

    if (!username || !email || !password) {
      errorDiv.textContent = 'Tüm alanlar zorunludur';
      return;
    }

    try {
      await api.register({ username, email, password, role: isAuthor ? 'author' : 'reader' });
      router.navigate('login');
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },
};

// Başlat
document.addEventListener('DOMContentLoaded', () => {
  router.navigate('home');
});