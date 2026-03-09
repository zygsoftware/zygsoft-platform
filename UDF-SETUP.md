# UDF Converter — Setup & Deployment

Bu belge, ZYGSOFT platformundaki UDF dönüştürücü ürününün nasıl çalıştırılacağını ve test edileceğini açıklar.

---

## 1. Genel Bakış

### Mevcut Durum

| Bileşen | Durum |
|---------|-------|
| **Next.js Uygulaması** | Çalışıyor — locale, auth, dashboard, admin, ödeme akışı |
| **UDF Proxy API** | `/api/tools/udf-convert` — session + subscription kontrolü, hata yakalama |
| **Python UDF Aracı** | CLI/GUI — web API yoktu |
| **FastAPI Mikroservis** | **Yeni** — `tools/udf-converter/api/main.py` |

### Yapılan Değişiklikler

1. **FastAPI Mikroservis eklendi** (`tools/udf-converter/api/main.py`)
   - DOCX → UDF dönüşümü
   - `POST /api/convert/doc-to-udf` endpoint
   - `GET /health` sağlık kontrolü

2. **UDF Proxy iyileştirildi** (`src/app/api/tools/udf-convert/route.ts`)
   - Eksik dosya, desteklenmeyen format, servis kapalı, zaman aşımı hata mesajları
   - `UDF_MICROSERVICE_URL` env değişkeni desteği

3. **Doc-to-UDF arayüzü güncellendi** (`src/app/[locale]/dashboard/tools/doc-to-udf/page.tsx`)
   - Sadece DOCX → UDF destekleniyor (API ile uyumlu)
   - Antet/şablon seçenekleri kaldırıldı
   - Kilitli durumda "Abonelikleri Görüntüle" ve "Ödeme Bildir" CTA

4. **Ürün akışı iyileştirildi**
   - Dashboard products: Kilitli ürünlere tıklanınca `/abonelikler` sayfasına yönlendirme

---

## 2. Python Mikroservisini Çalıştırma

### Gereksinimler

- Python 3.9+
- `python-docx` (mevcut `requirements.txt` içinde)

### Kurulum

```bash
cd tools/udf-converter

# Temel bağımlılıklar
pip install -r requirements.txt

# API bağımlılıkları
pip install -r requirements-api.txt
```

### Başlatma

```bash
cd tools/udf-converter
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Veya:

```bash
cd tools/udf-converter
chmod +x run-api.sh
./run-api.sh
```

Varsayılan adres: `http://127.0.0.1:8000`

### Sağlık Kontrolü

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","service":"udf-converter"}
```

---

## 3. Ortam Değişkenleri

`.env.local` veya `.env` dosyasına ekleyin:

```env
# UDF dönüşüm mikroservisi URL (opsiyonel, varsayılan: http://127.0.0.1:8000)
UDF_MICROSERVICE_URL=http://127.0.0.1:8000
```

Production’da mikroservis farklı bir sunucuda çalışıyorsa:

```env
UDF_MICROSERVICE_URL=https://udf-api.yourdomain.com
```

---

## 4. Ürün Akışının Test Edilmesi

### 4.1 Kayıt ve Giriş

1. Ana sayfa → **Abonelikler** (`/abonelikler`)
2. **Kayıt Ol** → `/register` ile hesap oluştur
3. **Giriş Yap** → `/login`

### 4.2 Abonelik ve Ödeme Bildirimi

1. **Abonelikler** sayfasında **Hukuk UDF Dönüştürücü** kartında **Satın Al**
2. `/dashboard/billing?product=udf-toolkit` sayfasına gider
3. Tutar gir, dekont yükle, **Gönder**
4. Ödeme `pending` olarak kaydedilir, abonelik `pending_approval` olur

### 4.3 Admin Onayı

1. Admin olarak giriş yap: `/admin/login`
2. **Ödemeler** sayfası: `/admin/payments`
3. Bekleyen ödemeyi **Onayla**
4. Müşteri aboneliği `active` olur, `endsAt` 30 gün sonrasına ayarlanır

### 4.4 UDF Aracının Kullanımı

1. Müşteri hesabıyla giriş yap (oturum yenilensin)
2. **Dashboard** → **Hukuk UDF Dönüştürücü** → **Başlat**
3. Veya doğrudan: `/dashboard/tools/doc-to-udf`
4. `.docx` dosyası sürükle-bırak veya seç
5. **Dönüştürmeyi Başlat** → İndirilen `.udf` dosyası

### 4.5 Mikroservis Kapalıysa

- UDF proxy 503 döner: "Dönüşüm servisine bağlanılamadı..."
- Arayüzde ilgili dosya satırında hata mesajı gösterilir

---

## 5. Desteklenen Dönüşümler

| Kaynak | Hedef | Durum |
|--------|-------|-------|
| DOCX | UDF | Destekleniyor |

UDF → DOCX ve UDF → PDF Python CLI’da mevcut; web API’ye eklenebilir.

---

## 6. Klasör Yapısı

```
tools/udf-converter/
├── api/
│   └── main.py           # FastAPI uygulaması
├── main.py               # DOCX → UDF dönüşüm mantığı
├── docx_to_udf.py        # CLI giriş noktası
├── calisanudfcontent.xml # UDF şablonu
├── requirements.txt      # Python bağımlılıkları
├── requirements-api.txt  # FastAPI, uvicorn, python-multipart
└── run-api.sh            # API başlatma scripti
```

---

## 7. Manuel Olarak Yapılması Gerekenler

1. **Ürünü veritabanına eklemek** (isteğe bağlı)
   - İlk ödeme bildirimi geldiğinde `productId` slug ile otomatik oluşturulabilir
   - Veya `/admin/products` üzerinden `udf-toolkit` slug’lı ürün eklenebilir

2. **Production deploy**
   - Python mikroservisini ayrı bir sunucu/container’da çalıştırın
   - `UDF_MICROSERVICE_URL` ile Next.js’e bağlayın
   - CORS ve güvenlik ayarlarını production için güncelleyin

3. **Dosya boyutu limiti**
   - Gerekirse FastAPI ve Next.js tarafında `max_upload_size` sınırları ekleyin
