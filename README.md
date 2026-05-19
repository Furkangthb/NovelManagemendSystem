# 📖 Dijital Novel Yayın ve Yönetim Sistemi

Yazarların novel ve bölüm yayınlayabildiği, okuyucuların okuyup yorum yapabildiği web tabanlı bir platform.

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Vanilla JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Veritabanı | PostgreSQL |
| Auth | JWT + bcrypt |
| Dokümantasyon | Swagger / OpenAPI 3.0 |
| Test | Jest |

## 📁 Proje Yapısı

```text
NovelManagemendSystem/
├── Backend/
│   ├── config/          # Veritabanı bağlantısı
│   ├── controllers/     # HTTP istek yönetimi
│   ├── middlewares/     # JWT doğrulama
│   ├── models/          # Veritabanı sorguları
│   ├── routes/          # API endpoint tanımları
│   ├── services/        # İş mantığı
│   ├── tests/           # Unit testler
│   ├── app.js           # Uygulama giriş noktası
│   ├── swagger.yaml     # API dokümantasyonu
│   └── .env             # Ortam değişkenleri
└── frontend/
    ├── css/             # Stil dosyaları
    ├── js/
    │   ├── pages/       # Sayfa bileşenleri
    │   ├── api.js       # Backend iletişimi
    │   ├── auth.js      # Kullanıcı işlemleri
    │   └── app.js       # Router ve navbar
    └── index.html       # Tek sayfa uygulaması
```

## ⚙️ Kurulum

### Gereksinimler
- Node.js v18+
- PostgreSQL v14+

### 1. Repoyu Klonla
```bash
git clone https://github.com/Furkangthb/NovelManagemendSystem.git
cd NovelManagemendSystem
```

### 2. PostgreSQL Kurulumu
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE novel_db;
CREATE USER novel_user WITH PASSWORD 'novel123';
GRANT ALL PRIVILEGES ON DATABASE novel_db TO novel_user;
GRANT ALL ON SCHEMA public TO novel_user;
ALTER DATABASE novel_db OWNER TO novel_user;
\q
```

### 3. Tabloları Oluştur
psql ile (veya DBeaver üzerinden) şu komutları çalıştır:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(10) DEFAULT 'reader',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE novels (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Devam Ediyor',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(novel_id, user_id)
);
```

### 4. Backend Kurulumu
```bash
cd Backend
npm install
```

Backend klasöründe `.env` dosyası oluştur:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=novel_db
DB_USER=novel_user
DB_PASSWORD=novel123
JWT_SECRET=novel_gizli_anahtar_2024
JWT_EXPIRES_IN=24h
```

### 5. Backend'i Başlat
```bash
npm start
```

### 6. Frontend'i Başlat
Yeni bir terminal sekmesi açarak:
```bash
cd ../frontend
npx serve .
```

## 🌐 Kullanım

| Servis | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger UI | http://localhost:5000/api-docs |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | /api/auth/register | Kayıt ol |
| POST | /api/auth/login | Giriş yap |

### Novels
| Method | Endpoint | Açıklama | Auth |
|---|---|---|---|
| GET | /api/novels | Tüm noveller | ❌ |
| GET | /api/novels?genre=X&status=Y&search=Z | Filtrele/Ara | ❌ |
| GET | /api/novels/:id | Novel detayı | ❌ |
| POST | /api/novels | Novel oluştur | ✅ Yazar |
| PUT | /api/novels/:id | Novel güncelle | ✅ Yazar |
| DELETE | /api/novels/:id | Novel sil | ✅ Yazar |

### Chapters
| Method | Endpoint | Açıklama | Auth |
|---|---|---|---|
| GET | /api/novels/:id/chapters | Bölüm listesi | ❌ |
| GET | /api/chapters/:id | Bölüm detayı | ❌ |
| POST | /api/novels/:id/chapters | Bölüm ekle | ✅ Yazar |
| PUT | /api/chapters/:id | Bölüm güncelle | ✅ Yazar |
| DELETE | /api/chapters/:id | Bölüm sil | ✅ Yazar |

### Comments
| Method | Endpoint | Açıklama | Auth |
|---|---|---|---|
| GET | /api/novels/:id/comments | Yorumlar | ❌ |
| POST | /api/novels/:id/comments | Yorum ekle | ✅ |
| DELETE | /api/novels/comments/:id | Yorum sil | ✅ |

## 🧪 Testleri Çalıştır

```bash
cd Backend
npm test
```

Toplam **34 unit test** — authService, novelService, chapterService ve commentService katmanları %100 başarı oranıyla test edilmektedir.

## 🗄️ Veritabanı Şeması

```
users (id, username, email, password_hash, role, created_at)
  ↓ 1-N
novels (id, user_id, title, author, description, genre, status, created_at)
  ↓ 1-N                      ↓ 1-N
chapters (...)             comments (...)
```

## 👤 Kullanıcı Rolleri

| Rol | Yetki |
|---|---|
| reader | Novel okuma, yorum yapma |
| author | Novel/bölüm ekleme, düzenleme, silme |