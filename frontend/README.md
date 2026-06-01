# Frontend

Frontend dibangun dengan React, TypeScript, dan Vite.

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Frontend biasanya berjalan di `http://localhost:5173`.

## Environment

API backend dibaca dari `VITE_API_URL`.

Contoh:

```env
VITE_API_URL="http://localhost:3000"
```

Kalau variabel ini tidak diisi, frontend akan memakai default `http://localhost:3000`.

## Build

```bash
npm run build
```
