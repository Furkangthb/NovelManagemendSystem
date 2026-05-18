const novelPage = {
  render: async ({ id } = {}) => {
    appEl.innerHTML = `<p class="loading">Yükleniyor...</p>`;

    try {
      const [novelData, chaptersData, commentsData] = await Promise.all([
        api.getNovel(id),
        api.getChapters(id),
        api.getComments(id),
      ]);

      const novel = novelData.novel;
      const chapters = chaptersData.chapters;
      const comments = commentsData.comments;
      const user = auth.getUser();
      const isOwner = user && user.id === novel.user_id;

      appEl.innerHTML = `
        <div class="novel-detail">
          <button class="back-btn" onclick="router.navigate('home')">← Geri Dön</button>

          <div class="novel-header">
            <div class="novel-cover-placeholder">📚</div>
            <div class="novel-meta">
              <span class="novel-genre-badge">${novel.genre || 'Belirsiz'}</span>
              <h1 class="novel-title">${novel.title}</h1>
              <p class="novel-author">✍️ ${novel.author}</p>
              <p class="novel-description">${novel.description || ''}</p>
              <div class="novel-actions">
                ${isOwner ? `
                  <button class="btn btn-outline" onclick="novelPage.showEditForm(${JSON.stringify(novel).replace(/"/g, '&quot;')})">
                    ✏️ Düzenle
                  </button>
                  <button class="btn btn-danger" onclick="novelPage.deleteNovel(${novel.id})">
                    🗑️ Sil
                  </button>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- BÖLÜMLER -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">📑 Bölümler (${chapters.length})</h2>
              ${isOwner ? `
                <button class="btn btn-primary" onclick="novelPage.showAddChapter(${novel.id})">
                  + Bölüm Ekle
                </button>
              ` : ''}
            </div>
            <div id="chapters-list">
              ${chapters.length === 0
          ? '<p class="empty">Henüz bölüm yok 📭</p>'
          : chapters.map(ch => `
                  <div class="chapter-item">
                    <span class="chapter-item-title" onclick="router.navigate('read', {chapterId: ${ch.id}})">
                      Bölüm ${ch.chapter_number}: ${ch.title}
                    </span>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span class="chapter-item-date">
                        ${new Date(ch.created_at).toLocaleDateString('tr-TR')}
                      </span>
                      ${isOwner ? `
                        <button class="btn btn-danger" style="padding:0.2rem 0.6rem; font-size:0.8rem;"
                          onclick="novelPage.deleteChapter(${ch.id}, ${novel.id})">🗑️</button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')
        }
            </div>
          </div>

          <!-- YORUMLAR -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">💬 Yorumlar (${comments.length})</h2>
            </div>

            ${auth.isLoggedIn() ? `
              <div class="comment-form">
                <textarea id="comment-text" placeholder="Yorumunuzu yazın..."></textarea>
                <div class="rating-group">
                  <span>Puan:</span>
                  ${[1, 2, 3, 4, 5].map(n => `
                    <label>
                      <input type="radio" name="rating" value="${n}"> ${n}⭐
                    </label>
                  `).join('')}
                </div>
                <div id="comment-error" class="error-msg"></div>
                <button class="btn btn-primary" onclick="novelPage.addComment(${novel.id})">
                  Yorum Ekle
                </button>
              </div>
            ` : `
              <p style="margin-bottom:1rem; color:var(--muted);">
                Yorum yapmak için 
                <span class="link" onclick="router.navigate('login')">giriş yapın</span>
              </p>
            `}

            <div id="comments-list">
              ${comments.length === 0
          ? '<p class="empty">Henüz yorum yok 📭</p>'
          : comments.map(c => `
                  <div class="comment-item">
                    <div class="comment-header">
                      <div>
                        <span class="comment-username">👤 ${c.username}</span>
                        <span class="comment-rating" style="margin-left:0.8rem;">
                          ${'⭐'.repeat(c.rating)}
                        </span>
                      </div>
                      ${user && user.id === c.user_id ? `
                        <button class="btn btn-danger" style="padding:0.2rem 0.6rem; font-size:0.8rem;"
                          onclick="novelPage.deleteComment(${c.id}, ${novel.id})">🗑️</button>
                      ` : ''}
                    </div>
                    <p class="comment-text">${c.text}</p>
                  </div>
                `).join('')
        }
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      appEl.innerHTML = `<p class="error-msg">${error.message}</p>`;
    }
  },

  showAddChapter: (novelId) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3 class="modal-title">📝 Yeni Bölüm Ekle</h3>
        <div class="form-group">
          <label class="form-label">Bölüm Numarası</label>
          <input type="number" id="chapter-number" class="form-input" placeholder="1" min="1" max="9999">
        </div>
        <div class="form-group">
          <label class="form-label">Bölüm Başlığı</label>
          <input type="text" id="chapter-title" class="form-input" placeholder="Başlık">
        </div>
        <div class="form-group">
          <label class="form-label">İçerik</label>
          <textarea id="chapter-content" class="form-input" rows="8" 
            style="resize:vertical; min-height:150px;" placeholder="Bölüm içeriği..."></textarea>
        </div>
        <div id="chapter-error" class="error-msg"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="novelPage.addChapter(${novelId})">Ekle</button>
          <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addChapter: async (novelId) => {
    const chapter_number = parseInt(document.getElementById('chapter-number').value);
    const title = document.getElementById('chapter-title').value;
    const content = document.getElementById('chapter-content').value;
    const errorDiv = document.getElementById('chapter-error');

    if (!chapter_number || !title || !content) {
      errorDiv.textContent = 'Tüm alanlar zorunludur';
      return;
    }

    try {
      await api.createChapter(novelId, { chapter_number, title, content });
      document.querySelector('.modal-overlay').remove();
      novelPage.render({ id: novelId });
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  deleteChapter: async (chapterId, novelId) => {
    if (!confirm('Bölümü silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteChapter(chapterId);
      novelPage.render({ id: novelId });
    } catch (error) {
      alert(error.message);
    }
  },

  addComment: async (novelId) => {
    const text = document.getElementById('comment-text').value;
    const ratingEl = document.querySelector('input[name="rating"]:checked');
    const errorDiv = document.getElementById('comment-error');

    if (!text || !ratingEl) {
      errorDiv.textContent = 'Yorum ve puan zorunludur';
      return;
    }

    try {
      await api.createComment(novelId, { text, rating: parseInt(ratingEl.value) });
      novelPage.render({ id: novelId });
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  deleteComment: async (commentId, novelId) => {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteComment(commentId);
      novelPage.render({ id: novelId });
    } catch (error) {
      alert(error.message);
    }
  },

  showEditForm: (novel) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3 class="modal-title">✏️ Novel Düzenle</h3>
        <div class="form-group">
          <label class="form-label">Başlık</label>
          <input type="text" id="edit-title" class="form-input" value="${novel.title}">
        </div>
        <div class="form-group">
          <label class="form-label">Yazar</label>
          <input type="text" id="edit-author" class="form-input" value="${novel.author}">
        </div>
        <div class="form-group">
          <label class="form-label">Açıklama</label>
          <textarea id="edit-description" class="form-input" rows="3">${novel.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Tür</label>
          <select id="edit-genre" class="form-input">
            ${['Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'].map(g => `
              <option value="${g}" ${novel.genre === g ? 'selected' : ''}>${g}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Durum</label>
          <select id="edit-status" class="form-input">
            ${['Devam Ediyor', 'Tamamlandı', 'Askıya Alındı'].map(s => `
              <option value="${s}" ${novel.status === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>
        </div>
        <div id="edit-error" class="error-msg"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="novelPage.updateNovel(${novel.id})">Güncelle</button>
          <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  updateNovel: async (id) => {
    const title = document.getElementById('edit-title').value;
    const author = document.getElementById('edit-author').value;
    const description = document.getElementById('edit-description').value;
    const genre = document.getElementById('edit-genre').value;
    const status = document.getElementById('edit-status').value;
    const errorDiv = document.getElementById('edit-error');

    if (!title || !author) {
      errorDiv.textContent = 'Başlık ve yazar zorunludur';
      return;
    }

    try {
      await api.updateNovel(id, { title, author, description, genre, status });
      document.querySelector('.modal-overlay').remove();
      novelPage.render({ id });
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  deleteNovel: async (id) => {
    if (!confirm('Noveli silmek istediğinize emin misiniz?')) return;
    try {
      await api.deleteNovel(id);
      router.navigate('home');
    } catch (error) {
      alert(error.message);
    }
  },
};