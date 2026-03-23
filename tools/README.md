# Hukuk araçları — Python bağımlılıkları

PDF sıkıştırma, PDF → Word ve PDF → görsel gibi route’lar sunucuda **`python3`** ile `tools/` altındaki scriptleri çalıştırır. Bu yüzden **PyMuPDF** (ve ilgili paketler) kurulu olmalıdır.

## Yerel geliştirme (Mac / Linux)

Proje kökünden:

```bash
npm run install:legal-python
```

veya:

```bash
python3 -m pip install -r tools/requirements-legal.txt
```

Kurulumu doğrulamak:

```bash
python3 -c "import fitz; print('PyMuPDF OK', fitz.__doc__[:30])"
```

## Üretim sunucusu

- **Kendi VPS / Docker** kullanıyorsanız: imajda veya deploy sonrası aynı `pip install -r tools/requirements-legal.txt` komutunu çalıştırın; `python3` PATH’te olmalı.
- **Vercel / serverless** ortamında genelde `python3` + `pip` ile bu scriptler **çalışmaz**. Bu araçlar için Node tabanlı alternatif, ayrı bir Python mikroservis veya Docker tabanlı deploy gerekir.

Dosya: `tools/requirements-legal.txt`

## Panel URL’leri (locale slugları)

`src/i18n/routing.ts` içindeki `pathnames` ile **iç rota** (`/dashboard/...`) sabit kalır; tarayıcıda gördüğünüz yol dile göre değişir:

| Sayfa (iç) | Türkçe (varsayılan) | İngilizce (`/en/...`) |
|------------|----------------------|------------------------|
| Panel ana | `/panel` | `/en/dashboard` |
| Ürünler | `/panel/urunler` | `/en/dashboard/products` |
| Hizmetler | `/panel/hizmetler` | `/en/dashboard/services` |
| Araçlar | `/panel/araclar` | `/en/dashboard/tools` |
| Destek | `/panel/destek` | `/en/dashboard/support` |
| Ödemeler | `/panel/odemeler` | `/en/dashboard/payments` |
| Hesap | `/panel/hesap` | `/en/dashboard/profile` |

Kodda bağlantılar **`href="/dashboard/..."`** (iç yol) ile kalır; `Link` bileşeni (`@/i18n/navigation`) otomatik olarak doğru dildeki slug’a çevirir.
