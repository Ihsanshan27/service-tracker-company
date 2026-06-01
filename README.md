# Vehicle Tracker

Vehicle Tracker adalah aplikasi manajemen kendaraan dengan frontend React + Vite dan backend NestJS + Prisma + PostgreSQL.

## Struktur Project

- `frontend`: aplikasi React
- `backend`: REST API NestJS
- `docker-compose.yml`: service Docker untuk PostgreSQL, backend, dan frontend

## Menjalankan Secara Lokal

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend berjalan di `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend Vite biasanya berjalan di `http://localhost:5173`.

### Database

Backend membutuhkan PostgreSQL melalui `DATABASE_URL` di `backend/.env`.

Contoh koneksi ke PostgreSQL lokal:

```env
DATABASE_URL="postgresql://vehicle_tracker:vehicle_tracker_password@localhost:5432/vehicle_tracker"
```

## Docker

### Menjalankan PostgreSQL Saja

```bash
docker compose up -d database
```

Akses PostgreSQL:

- Host: `localhost`
- Port: `5432`
- Database: `vehicle_tracker`
- User: `vehicle_tracker`
- Password: `vehicle_tracker_password`

### Menjalankan Semua Service

```bash
docker compose up --build
```

Service yang tersedia:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

### Menghentikan Service

```bash
docker compose down
```

### Menghapus Volume Database

```bash
docker compose down -v
```

Panduan Docker singkat juga tersedia di [DOCKER.md](./DOCKER.md).
