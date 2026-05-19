const readPage = {
  novelId: null,
  chapterId: null,
  pages: [],
  currentPage: 0,
  allChapters: [],

  render: async ({ chapterId } = {}) => {
    appEl.innerHTML = '<div style="text-align:center; padding: 3rem;"><p class="loading">Bölüm yükleniyor...</p></div>';
    
    try {
      const data = await api.getChapter(chapterId);
      const chapter = data.chapter;
      
      readPage.novelId = chapter.novel_id;
      readPage.chapterId = chapter.id;
      
      readPage.pages = chapter.content.split('|||PAGE|||');
      readPage.currentPage = 0; 
      
      const chaptersData = await api.getChapters(readPage.novelId);
      readPage.allChapters = chaptersData.chapters.sort((a, b) => a.chapter_number - b.chapter_number);

      readPage.renderContent();
    } catch (error) {
      appEl.innerHTML = `<div style="text-align:center; padding: 3rem;"><p class="error-msg">${error.message}</p></div>`;
    }
  },

  renderContent: () => {
    const chapterIndex = readPage.allChapters.findIndex(ch => ch.id === readPage.chapterId);
    const chapter = readPage.allChapters[chapterIndex];
    
    const prevChapter = chapterIndex > 0 ? readPage.allChapters[chapterIndex - 1] : null;
    const nextChapter = chapterIndex < readPage.allChapters.length - 1 ? readPage.allChapters[chapterIndex + 1] : null;

    const hasPrevPage = readPage.currentPage > 0;
    const hasNextPage = readPage.currentPage < readPage.pages.length - 1;

    let prevBtnHTML = '';
    if (hasPrevPage) {
      prevBtnHTML = `<button class="btn btn-outline" onclick="readPage.changePage(-1)">← Önceki Sayfa</button>`;
    } else if (prevChapter) {
      prevBtnHTML = `<button class="btn btn-outline" onclick="router.navigate('read', {chapterId: ${prevChapter.id}})">← Önceki Bölüm</button>`;
    } else {
      prevBtnHTML = `<button class="btn btn-outline" disabled style="opacity: 0.3; cursor: not-allowed;">← Önceki</button>`;
    }

    let nextBtnHTML = '';
    if (hasNextPage) {
      nextBtnHTML = `<button class="btn btn-primary" onclick="readPage.changePage(1)">Sonraki Sayfa →</button>`;
    } else if (nextChapter) {
      nextBtnHTML = `<button class="btn btn-primary" onclick="router.navigate('read', {chapterId: ${nextChapter.id}})">Sonraki Bölüm →</button>`;
    } else {
      nextBtnHTML = `<button class="btn btn-primary" disabled style="opacity: 0.3; cursor: not-allowed;">Sonraki →</button>`;
    }

    const pageContent = readPage.pages[readPage.currentPage]
      .split('\n')
      .filter(p => p.trim() !== '')
      .map(p => `<p style="margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.15rem; color: #e0e0e0;">${p}</p>`)
      .join('');

    appEl.innerHTML = `
      <div class="read-page" style="max-width: 800px; margin: 0 auto; padding: 2rem 1rem;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <button class="btn btn-outline" onclick="router.navigate('novel', {id: ${readPage.novelId}})" style="border-radius: 20px;">
            📚 Roman'a Dön
          </button>
          <div style="color: var(--muted); font-size: 0.95rem; background: rgba(255,255,255,0.05); padding: 0.5rem 1rem; border-radius: 20px;">
            Bölüm ${chapter.chapter_number} • Sayfa ${readPage.currentPage + 1} / ${readPage.pages.length}
          </div>
        </div>

        <h1 style="text-align: center; margin-bottom: 2.5rem; color: var(--text-main); font-size: 2rem;">
          ${chapter.title}
        </h1>

        <div class="chapter-content" style="
          background: var(--card-bg); 
          padding: 3rem 2rem; 
          border-radius: 12px; 
          box-shadow: 0 8px 16px rgba(0,0,0,0.2); 
          margin-bottom: 2.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        ">
          ${pageContent}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--card-bg); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          ${prevBtnHTML}
          <span style="color: var(--muted); font-size: 0.9rem; font-weight: 500;">
            ${readPage.currentPage + 1} / ${readPage.pages.length}
          </span>
          ${nextBtnHTML}
        </div>
        
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  changePage: (direction) => {
    readPage.currentPage += direction;
    readPage.renderContent();
  }
};

window.readPage = readPage;