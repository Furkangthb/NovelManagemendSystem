const panelPage = {
  render: async () => {
    if (!auth.isAuthor()) {
      router.navigate('home');
      return;
    }

    appEl.innerHTML = `
      <div>
        <div class="panel-header">
          <h1 class="panel-title">✍️ Yazar Paneli</h1>
          <button class="btn btn-primary" onclick="panelPage.showAddNovel()">
            + Yeni Novel
          </button>
        </div>
        <div id="my-novels">
          <p class="loading">Yükleniyor...</p>
        </div>
      </div>
    `;

    await panelPage.loadMyNovels();
  },

  loadMyNovels: async () => {
    try {
      const data = await api.getNovels();
      const user = auth.getUser();
      const myNovels = data.novels.filter(n => n.user_id === user.id);
      const container = document.getElementById('my-novels');

      if (myNovels.length === 0) {
        container.innerHTML = '<p class="empty">Henüz novel eklemediniz 📭</p>';
        return;
      }

      container.innerHTML = myNovels.map(novel => `
        <div class="panel-novel-item">
          <div>
            <div class="panel-novel-title" 
              onclick="router.navigate('novel', {id: ${novel.id}})">
              ${novel.title}
            </div>
            <div class="panel-novel-meta">
              ${novel.genre || 'Tür yok'} • ${novel.status}
            </div>
          </div>
          <div class="panel-novel-actions">
            <button class="btn btn-outline" 
              onclick="router.navigate('novel', {id: ${novel.id}})">
              Görüntüle
            </button>
            <button class="btn btn-danger" 
              onclick="panelPage.deleteNovel(${novel.id})">
              🗑️ Sil
            </button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      document.getElementById('my-novels').innerHTML = `
        <p class="error-msg">${error.message}</p>
      `;
    }
  },

  showAddNovel: () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3 class="modal-title">📚 Yeni Novel Ekle</h3>
        <div class="form-group">
          <label class="form-label">Başlık</label>
          <input type="text" id="novel-title" class="form-input" placeholder="Novel başlığı">
        </div>
        <div class="form-group">
          <label class="form-label">Yazar / Çevirmen</label>
          <input type="text" id="novel-author" class="form-input" placeholder="Yazar adı">
        </div>
        <div class="form-group">
          <label class="form-label">Açıklama</label>
          <textarea id="novel-description" class="form-input" rows="3" 
            placeholder="Novel hakkında kısa bilgi..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tür</label>
          <select id="novel-genre" class="form-input">
            <option value="">Tür seçin</option>
            ${['Aksiyon','Fantastik','Romance','Korku','Bilim Kurgu','Gizem','Dram','Komedi'].map(g => `
              <option value="${g}">${g}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Durum</label>
          <select id="novel-status" class="form-input">
            ${['Devam Ediyor','Tamamlandı','Askıya Alındı'].map(s => `
              <option value="${s}">${s}</option>
            `).join('')}
          </select>
        </div>
        <div id="novel-error" class="error-msg"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="panelPage.addNovel()">Ekle</button>
          <button class="btn btn-outline" 
            onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addNovel: async () => {
    const title = document.getElementById('novel-title').value;
    const author = document.getElementById('novel-author').value;
    const description = document.getElementById('novel-description').value;
    const genre = document.getElementById('novel-genre').value;
    const status = document.getElementById('novel-status').value;
    const errorDiv = document.getElementById('novel-error');

    if (!title || !author) {
      errorDiv.textContent = 'Başlık ve yazar zorunludur';
      return;
    }

    try {
      await api.createNovel({ title, author, description, genre, status });
      document.querySelector('.modal-overlay').remove();
      await panelPage.loadMyNovels();
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  deleteNovel: async (id) => {
    if (!confirm('Noveli silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteNovel(id);
      await panelPage.loadMyNovels();
    } catch (error) {
      alert(error.message);
    }
  },
};