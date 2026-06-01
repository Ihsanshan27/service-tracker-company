# Backend

Backend dibangun dengan NestJS dan Prisma, menggunakan PostgreSQL sebagai database.

## Menjalankan Lokal

```bash
npm install
npm run start:dev
```

API berjalan di `http://localhost:3000`.

## Environment

Contoh variabel yang dipakai:

```env
DATABASE_URL="postgresql://vehicle_tracker:vehicle_tracker_password@localhost:5432/vehicle_tracker"
JWT_SECRET="vehicle-tracker-secret-key-2026"
JWT_EXPIRES_IN="1d"
PORT=3000
```

## Prisma

Menjalankan migration:

```bash
npx prisma migrate dev
```

Menjalankan seed:

```bash
npx prisma db seed
```

## Build dan Test

```bash
npm run build
npm run test
npm run test:e2e
```
