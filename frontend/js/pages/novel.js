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

      let genresArray = novel.genres || [];
      if (typeof novel.genres === 'string') {
        genresArray = novel.genres.replace(/[{}]/g, '').split(',').map(g => g.trim());
      }

      // --- YENİ EKLENEN KISIM: Kapağı Hafızadan Çek ---
      const coverUrl = await getCover(novel.title, genresArray[0] || '');

      appEl.innerHTML = `
        <div class="novel-detail">
          <button class="back-btn" onclick="router.navigate('home')">← Geri Dön</button>

          <div class="novel-header">
            <div class="novel-cover" style="flex-shrink: 0; width: 220px; height: 320px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
              <img src="${coverUrl}" alt="${novel.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1614729939124-03290b5609ce?w=400&h=600&fit=crop'">
            </div>
            
            <div class="novel-meta" style="flex: 1;">
              <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                ${genresArray.length > 0 && genresArray[0] !== ""
                  ? genresArray.map(g => `<span class="novel-genre-badge">${g}</span>`).join('') 
                  : '<span class="novel-genre-badge">Belirsiz</span>'}
              </div>
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
                        <button class="btn btn-outline" style="padding:0.2rem 0.6rem; font-size:0.8rem; margin-right: 5px;"
                          onclick="novelPage.showEditChapter(${ch.id}, ${novel.id})">✏️</button>
                        <button class="btn btn-danger" style="padding:0.2rem 0.6rem; font-size:0.8rem;"
                          onclick="novelPage.deleteChapter(${ch.id}, ${novel.id})">🗑️</button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')
        }
            </div>
          </div>

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

  addPageInput: () => {
    const container = document.querySelector('.modal-overlay #pages-container');
    if (!container) return;
    
    const pageCount = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'form-group page-input-group';
    div.style.position = 'relative';
    div.innerHTML = `
      <label class="form-label">Sayfa ${pageCount}</label>
      <button class="btn btn-danger" style="position: absolute; right: 0; top: -5px; padding: 2px 8px; font-size: 0.8rem;" 
        onclick="this.parentElement.remove(); novelPage.updatePageLabels();">Sil</button>
      <textarea class="form-input chapter-page-content" rows="6" 
        style="resize:vertical;" placeholder="Sayfa ${pageCount} içeriği..."></textarea>
    `;
    container.appendChild(div);
  },

  updatePageLabels: () => {
    const groups = document.querySelectorAll('.modal-overlay .page-input-group');
    groups.forEach((group, index) => {
      group.querySelector('.form-label').textContent = `Sayfa ${index + 1}`;
      group.querySelector('.chapter-page-content').placeholder = `Sayfa ${index + 1} içeriği...`;
    });
  },

  showAddChapter: (novelId) => {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-height: 90vh; overflow-y: auto; width: 600px;">
        <h3 class="modal-title">📝 Yeni Bölüm Ekle</h3>
        <div class="form-group">
          <label class="form-label">Bölüm Numarası</label>
          <input type="number" id="chapter-number" class="form-input" placeholder="1" min="1" max="9999">
        </div>
        <div class="form-group">
          <label class="form-label">Bölüm Başlığı</label>
          <input type="text" id="chapter-title" class="form-input" placeholder="Başlık">
        </div>
        
        <div id="pages-container">
          <div class="form-group page-input-group" style="position: relative;">
            <label class="form-label">Sayfa 1</label>
            <textarea class="form-input chapter-page-content" rows="6" 
              style="resize:vertical;" placeholder="Sayfa 1 içeriği..."></textarea>
          </div>
        </div>

        <button class="btn btn-outline" style="width: 100%; margin-bottom: 1rem; border-style: dashed;" onclick="novelPage.addPageInput()">
          + Yeni Sayfa Ekle
        </button>

        <div id="chapter-error" class="error-msg"></div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="novelPage.addChapter(${novelId})">Bölümü Kaydet</button>
          <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  addChapter: async (novelId) => {
    const modal = document.querySelector('.modal-overlay');
    const chapter_number = parseInt(modal.querySelector('#chapter-number').value);
    const title = modal.querySelector('#chapter-title').value;
    
    const pageInputs = modal.querySelectorAll('.chapter-page-content');
    const pages = Array.from(pageInputs).map(input => input.value.trim()).filter(val => val !== '');
    const content = pages.join('|||PAGE|||');
    const errorDiv = modal.querySelector('#chapter-error');

   if (!chapter_number || !title || title.trim().length === 0 || !content) {
      errorDiv.textContent = 'Bölüm numarası, başlık (boş olamaz) ve en az bir sayfa içerik zorunludur.';
      return;
    }

    try {
      await api.createChapter(novelId, { chapter_number, title, content });
      modal.remove();
      novelPage.render({ id: novelId });
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  },

  showEditChapter: async (chapterId, novelId) => {
    try {
      document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

      const data = await api.getChapter(chapterId);
      const chapter = data.chapter;
      const pages = chapter.content.split('|||PAGE|||');

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal" style="max-height: 90vh; overflow-y: auto; width: 600px;">
          <h3 class="modal-title">✏️ Bölümü Düzenle</h3>
          <div class="form-group">
            <label class="form-label">Bölüm Numarası</label>
            <input type="number" id="edit-chapter-number" class="form-input" value="${chapter.chapter_number}">
          </div>
          <div class="form-group">
            <label class="form-label">Bölüm Başlığı</label>
            <input type="text" id="edit-chapter-title" class="form-input" value="${chapter.title}">
          </div>
          
          <div id="pages-container">
            ${pages.map((pageContent, index) => `
              <div class="form-group page-input-group" style="position: relative;">
                <label class="form-label">Sayfa ${index + 1}</label>
                ${index > 0 ? `<button class="btn btn-danger" style="position: absolute; right: 0; top: -5px; padding: 2px 8px; font-size: 0.8rem;" onclick="this.parentElement.remove(); novelPage.updatePageLabels();">Sil</button>` : ''}
                <textarea class="form-input chapter-page-content" rows="6" 
                  style="resize:vertical;" placeholder="Sayfa ${index + 1} içeriği...">${pageContent}</textarea>
              </div>
            `).join('')}
          </div>

          <button class="btn btn-outline" style="width: 100%; margin-bottom: 1rem; border-style: dashed;" onclick="novelPage.addPageInput()">
            + Yeni Sayfa Ekle
          </button>

          <div id="edit-chapter-error" class="error-msg"></div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="novelPage.updateChapter(${chapterId}, ${novelId})">Güncelle</button>
            <button class="btn btn-outline" onclick="document.querySelector('.modal-overlay').remove()">İptal</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    } catch (error) {
      alert("Bölüm bilgileri alınamadı: " + error.message);
    }
  },

  updateChapter: async (chapterId, novelId) => {
    const modal = document.querySelector('.modal-overlay');
    const chapter_number = parseInt(modal.querySelector('#edit-chapter-number').value);
    const title = modal.querySelector('#edit-chapter-title').value;
    
    const pageInputs = modal.querySelectorAll('.chapter-page-content');
    const pages = Array.from(pageInputs).map(input => input.value.trim()).filter(val => val !== '');
    const content = pages.join('|||PAGE|||');
    
    const errorDiv = modal.querySelector('#edit-chapter-error');

    if (!chapter_number || !title || title.trim().length === 0 || !content) {
      errorDiv.textContent = 'Bölüm numarası, başlık (boş olamaz) ve en az bir sayfa içerik zorunludur.';
      return;
    }

    try {
      await api.updateChapter(chapterId, { chapter_number, title, content });
      modal.remove();
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

    if (!text || text.trim().length === 0 || !ratingEl) {
      errorDiv.textContent = 'Yorum metni (sadece boşluk olamaz) ve puan zorunludur.';
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
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

    let genresArray = novel.genres || [];
    if (typeof novel.genres === 'string') {
      genresArray = novel.genres.replace(/[{}]/g, '').split(',').map(g => g.trim());
    }

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
          <label class="form-label">Türler</label>
          <div id="edit-genres" style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${['Aksiyon', 'Fantastik', 'Romance', 'Korku', 'Bilim Kurgu', 'Gizem', 'Dram', 'Komedi'].map(g => `
              <label style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" value="${g}" class="edit-genre-checkbox" 
                  ${genresArray.includes(g) ? 'checked' : ''}> ${g}
              </label>
            `).join('')}
          </div>
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
    const modal = document.querySelector('.modal-overlay');
    const title = modal.querySelector('#edit-title').value;
    const author = modal.querySelector('#edit-author').value;
    const description = modal.querySelector('#edit-description').value;
    const genres = Array.from(modal.querySelectorAll('.edit-genre-checkbox:checked')).map(cb => cb.value);
    const status = modal.querySelector('#edit-status').value;
    const errorDiv = modal.querySelector('#edit-error');

    if (!title || title.trim().length === 0 || !author || author.trim().length === 0) {
      errorDiv.textContent = 'Başlık ve yazar zorunludur ve sadece boşluktan oluşamaz.';
      return;
    }

    if (genres.length === 0) {
      errorDiv.textContent = 'En az bir tür seçmelisiniz';
      return;
    }

    try {
      await api.updateNovel(id, { title, author, description, genres, status });
      modal.remove();
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