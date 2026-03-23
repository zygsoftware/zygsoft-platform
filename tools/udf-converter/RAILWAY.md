# Railway Deploy

Bu servis su an yalnizca `doc-to-udf` endpoint'i icin hazirlandi.

## Railway'de deploy

1. Railway'de yeni bir project olustur.
2. Repo'yu bagla.
3. Root Directory olarak `tools/udf-converter` sec.
4. Deploy method olarak `Dockerfile` kullan.
5. Deploy et.

## Beklenen endpointler

- `GET /health`
- `POST /api/convert/doc-to-udf`

## Next.js tarafi

Vercel environment variable:

```env
UDF_MICROSERVICE_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

Sonra Vercel'i yeniden deploy et.

## Local Docker test

```bash
cd tools/udf-converter
docker build -t zygsoft-udf .
docker run --rm -p 8000:8000 zygsoft-udf
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```
