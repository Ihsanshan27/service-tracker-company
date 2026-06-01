# Docker Setup

## Menjalankan PostgreSQL Saja

```bash
docker compose up -d database
```

Akses PostgreSQL:

- Host: `localhost`
- Port: `5432`
- Database: `vehicle_tracker`
- User: `vehicle_tracker`
- Password: `vehicle_tracker_password`

## Menjalankan Semua Service

Jalankan seluruh aplikasi dengan:

```bash
docker compose up --build
```

Kalau sebelumnya pernah ada container lama dengan nama statis, bersihkan sekali saja dengan:

```bash
docker rm -f vehicle-tracker-backend vehicle-tracker-frontend vehicle-tracker-db
```

Service yang tersedia:

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

Backend akan menjalankan `prisma migrate deploy` saat container start, lalu menjalankan aplikasi NestJS.

Untuk menghentikan container:

```bash
docker compose down
```

Untuk menghapus data database lokal juga:

```bash
docker compose down -v
```
