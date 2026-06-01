Saya ingin membuat sistem Vehicle Maintenance Tracker berbasis web.

Sistem ini bukan GPS tracker, tetapi sistem untuk mencatat, memantau, dan mengelola maintenance kendaraan operasional. Sistem ini ditujukan untuk perusahaan, kampus, rental kecil, logistik kecil-menengah, atau organisasi yang memiliki banyak kendaraan dan masih mengelola servis, pajak, STNK, biaya, dan riwayat kendaraan menggunakan Excel.

Gunakan stack berikut:

Backend:
- NestJS
- PostgreSQL menggunakan Neon Database
- Prisma ORM
- JWT Authentication
- RBAC Role-Based Access Control
- REST API
- Validation DTO menggunakan class-validator
- Config menggunakan @nestjs/config
- Password hashing menggunakan bcrypt

Frontend:
- React + Vite
- React Router
- Axios
- Tailwind CSS
- Dashboard modern dan responsif
- Gunakan struktur folder yang rapi dan scalable

Role pengguna:
1. SUPER_ADMIN
   - Bisa mengakses semua fitur
   - Mengelola user, kendaraan, maintenance, biaya, laporan, dan master data

2. FLEET_MANAGER
   - Mengelola kendaraan
   - Mengelola jadwal maintenance
   - Melihat laporan
   - Mengelola assignment kendaraan

3. MECHANIC
   - Melihat work order
   - Mengupdate status maintenance
   - Menambahkan catatan pekerjaan

4. DRIVER
   - Melihat kendaraan yang ditugaskan
   - Melaporkan kerusakan kendaraan
   - Menginput odometer harian/perjalanan

5. FINANCE
   - Melihat dan mengelola biaya kendaraan
   - Melihat laporan pengeluaran

Fitur utama yang harus dibuat:

1. Authentication
- Login
- Register user hanya oleh SUPER_ADMIN
- JWT access token
- Middleware/guard untuk proteksi route
- Role guard untuk membatasi akses berdasarkan role
- Logout di frontend dengan menghapus token

2. Dashboard
Dashboard harus menampilkan ringkasan:
- Total kendaraan
- Kendaraan aktif
- Kendaraan tidak aktif
- Kendaraan dalam maintenance
- Jumlah maintenance yang akan jatuh tempo
- Jumlah dokumen kendaraan yang akan expired
- Total biaya kendaraan bulan ini
- Top 5 kendaraan dengan biaya maintenance terbesar
- Maintenance terbaru
- Reminder penting

3. Manajemen Kendaraan
Buat CRUD kendaraan dengan field:
- id
- plateNumber / nomor polisi
- brand / merk
- model
- year
- color
- vehicleType
- fuelType
- transmission
- chassisNumber / nomor rangka
- engineNumber / nomor mesin
- currentOdometer
- status: ACTIVE, INACTIVE, MAINTENANCE, SOLD
- purchaseDate
- notes
- createdAt
- updatedAt

Fitur:
- List kendaraan
- Search berdasarkan nomor polisi, merk, model
- Filter berdasarkan status dan tipe kendaraan
- Detail kendaraan
- Edit kendaraan
- Hapus kendaraan
- Update odometer kendaraan

4. Odometer Tracking
Buat fitur pencatatan odometer:
- id
- vehicleId
- userId
- odometer
- date
- notes
- createdAt

Validasi:
- Odometer baru tidak boleh lebih kecil dari odometer terakhir kendaraan
- Setelah input odometer, field currentOdometer pada kendaraan ikut terupdate

Frontend:
- Form input odometer
- Riwayat odometer per kendaraan
- Tampilkan grafik sederhana perkembangan kilometer jika memungkinkan

5. Maintenance Schedule
Buat fitur jadwal maintenance kendaraan:
- id
- vehicleId
- title
- description
- maintenanceType: OIL_CHANGE, SERVICE, TIRE_CHANGE, BRAKE_CHECK, BATTERY_CHECK, GENERAL_CHECK, OTHER
- intervalKm
- intervalMonth
- lastServiceDate
- lastServiceOdometer
- nextServiceDate
- nextServiceOdometer
- status: UPCOMING, DUE_SOON, OVERDUE, COMPLETED
- createdAt
- updatedAt

Fitur:
- Membuat jadwal maintenance berdasarkan kilometer, waktu, atau keduanya
- Sistem menghitung nextServiceDate dan nextServiceOdometer
- Menampilkan jadwal yang akan jatuh tempo
- Menampilkan jadwal yang overdue
- Filter berdasarkan status dan kendaraan

Aturan reminder:
- Jika nextServiceDate kurang dari atau sama dengan 7 hari dari hari ini, status menjadi DUE_SOON
- Jika nextServiceDate sudah lewat, status menjadi OVERDUE
- Jika currentOdometer mendekati nextServiceOdometer dalam jarak 500 km, status menjadi DUE_SOON
- Jika currentOdometer sudah melewati nextServiceOdometer, status menjadi OVERDUE

6. Maintenance History
Buat fitur riwayat servis/maintenance:
- id
- vehicleId
- scheduleId optional
- performedBy optional
- maintenanceType
- title
- description
- serviceDate
- odometerAtService
- workshopName
- cost
- status: COMPLETED, CANCELLED
- notes
- createdAt
- updatedAt

Fitur:
- Tambah riwayat maintenance
- Jika maintenance berasal dari schedule, maka schedule bisa ditandai completed
- Setelah completed, buat jadwal berikutnya berdasarkan interval
- Tampilkan riwayat maintenance per kendaraan

7. Vehicle Documents
Buat fitur dokumen kendaraan:
- id
- vehicleId
- documentType: STNK, TAX, INSURANCE, KIR, OTHER
- documentNumber
- issueDate
- expiryDate
- provider optional
- cost optional
- notes
- createdAt
- updatedAt

Fitur:
- CRUD dokumen kendaraan
- Reminder dokumen akan expired
- Status dokumen:
  - ACTIVE
  - EXPIRES_SOON
  - EXPIRED

Aturan:
- Jika expiryDate kurang dari atau sama dengan 30 hari dari hari ini, tampilkan sebagai EXPIRES_SOON
- Jika sudah lewat, tampilkan sebagai EXPIRED

8. Vehicle Expense / Cost Tracking
Buat fitur pencatatan biaya kendaraan:
- id
- vehicleId
- expenseType: FUEL, SERVICE, SPAREPART, TAX, INSURANCE, PARKING, TOLL, OTHER
- title
- description
- amount
- expenseDate
- odometer optional
- createdBy
- createdAt
- updatedAt

Fitur:
- Tambah biaya kendaraan
- Filter biaya berdasarkan kendaraan, tanggal, dan tipe biaya
- Total biaya per kendaraan
- Total biaya bulanan
- Breakdown biaya berdasarkan tipe
- Data ini akan digunakan untuk dashboard dan laporan

9. Driver Assignment
Buat fitur assignment kendaraan ke driver:
- id
- vehicleId
- driverId
- startDate
- endDate optional
- status: ACTIVE, ENDED
- notes
- createdAt
- updatedAt

Aturan:
- Satu kendaraan hanya boleh memiliki satu assignment aktif
- Satu driver boleh memiliki lebih dari satu kendaraan jika diperlukan
- Riwayat assignment harus tersimpan

10. Damage Report / Work Order
Buat fitur laporan kerusakan kendaraan:
- id
- vehicleId
- reportedBy
- assignedMechanic optional
- title
- description
- priority: LOW, MEDIUM, HIGH, URGENT
- status: REPORTED, APPROVED, IN_PROGRESS, COMPLETED, REJECTED
- reportDate
- completedDate optional
- notes
- createdAt
- updatedAt

Alur:
- DRIVER membuat laporan kerusakan
- FLEET_MANAGER bisa approve atau reject
- MECHANIC bisa update status menjadi IN_PROGRESS dan COMPLETED
- Setelah completed, sistem bisa membuat maintenance history jika diperlukan

11. User Management
Hanya SUPER_ADMIN yang bisa:
- Membuat user
- Melihat list user
- Mengubah role user
- Mengaktifkan/nonaktifkan user
- Menghapus user

Field user:
- id
- name
- email
- password
- role
- phone
- isActive
- createdAt
- updatedAt

12. Reports
Buat halaman laporan:
- Laporan biaya kendaraan per bulan
- Laporan maintenance kendaraan
- Laporan dokumen expired
- Laporan kendaraan dengan biaya tertinggi
- Laporan kendaraan yang sering maintenance
- Export sederhana ke CSV jika memungkinkan

13. Frontend Pages
Buat halaman frontend berikut:

Public:
- Login page

Protected:
- Dashboard
- Vehicles List
- Vehicle Detail
- Create Vehicle
- Edit Vehicle
- Odometer History
- Maintenance Schedule
- Maintenance History
- Vehicle Documents
- Expenses
- Driver Assignment
- Damage Reports / Work Orders
- Users Management
- Reports
- Profile

UI/UX:
- Sidebar navigation
- Topbar dengan user info dan logout
- Card dashboard
- Table dengan search dan filter
- Form input yang rapi
- Badge status dengan warna berbeda
- Loading state
- Error handling
- Empty state jika data kosong
- Modal konfirmasi delete
- Responsive layout untuk desktop dan mobile

14. Backend API
Buat REST API yang rapi:

Auth:
- POST /auth/login
- POST /auth/register
- GET /auth/profile

Users:
- GET /users
- GET /users/:id
- POST /users
- PATCH /users/:id
- DELETE /users/:id

Vehicles:
- GET /vehicles
- GET /vehicles/:id
- POST /vehicles
- PATCH /vehicles/:id
- DELETE /vehicles/:id
- PATCH /vehicles/:id/odometer

Odometer:
- GET /vehicles/:vehicleId/odometer
- POST /vehicles/:vehicleId/odometer

Maintenance Schedule:
- GET /maintenance-schedules
- GET /maintenance-schedules/:id
- POST /maintenance-schedules
- PATCH /maintenance-schedules/:id
- DELETE /maintenance-schedules/:id

Maintenance History:
- GET /maintenance-histories
- GET /maintenance-histories/:id
- POST /maintenance-histories
- PATCH /maintenance-histories/:id
- DELETE /maintenance-histories/:id

Documents:
- GET /vehicle-documents
- GET /vehicle-documents/:id
- POST /vehicle-documents
- PATCH /vehicle-documents/:id
- DELETE /vehicle-documents/:id

Expenses:
- GET /expenses
- GET /expenses/:id
- POST /expenses
- PATCH /expenses/:id
- DELETE /expenses/:id

Assignments:
- GET /assignments
- POST /assignments
- PATCH /assignments/:id/end
- DELETE /assignments/:id

Damage Reports:
- GET /damage-reports
- GET /damage-reports/:id
- POST /damage-reports
- PATCH /damage-reports/:id
- PATCH /damage-reports/:id/status

Reports:
- GET /reports/dashboard
- GET /reports/expenses
- GET /reports/maintenance
- GET /reports/documents

15. Database Design
Buat schema Prisma lengkap untuk:
- User
- Vehicle
- OdometerLog
- MaintenanceSchedule
- MaintenanceHistory
- VehicleDocument
- VehicleExpense
- DriverAssignment
- DamageReport

Gunakan relasi yang benar antar tabel.

Gunakan enum Prisma untuk:
- UserRole
- VehicleStatus
- MaintenanceType
- MaintenanceStatus
- DocumentType
- ExpenseType
- AssignmentStatus
- DamagePriority
- DamageStatus

16. Seed Data
Buat seed data awal:
- 1 SUPER_ADMIN
- 1 FLEET_MANAGER
- 1 MECHANIC
- 1 DRIVER
- 1 FINANCE
- 5 kendaraan contoh
- beberapa maintenance schedule
- beberapa expense
- beberapa dokumen kendaraan

Default login:
email: admin@example.com
password: password123

17. Environment
Gunakan file .env untuk backend:
DATABASE_URL="connection-string-neon"
JWT_SECRET="secret-key"
JWT_EXPIRES_IN="1d"
PORT=3000

Frontend .env:
VITE_API_URL=http://localhost:3000

18. Struktur Folder Backend
Gunakan struktur modular NestJS:

src/
├── auth/
├── users/
├── vehicles/
├── odometer/
├── maintenance-schedules/
├── maintenance-histories/
├── vehicle-documents/
├── expenses/
├── assignments/
├── damage-reports/
├── reports/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── dto/
│   └── filters/
├── prisma/
├── app.module.ts
└── main.ts

19. Struktur Folder Frontend
Gunakan struktur:

src/
├── api/
├── components/
│   ├── layout/
│   ├── ui/
│   └── forms/
├── pages/
├── routes/
├── hooks/
├── context/
├── utils/
├── types/
├── App.jsx
└── main.jsx

20. Yang harus dikerjakan oleh AI coding assistant:
- Generate backend NestJS lengkap
- Generate Prisma schema
- Generate migration
- Generate seed file
- Generate module, controller, service, DTO untuk setiap fitur
- Generate JWT auth dan RBAC guard
- Generate frontend React + Vite lengkap
- Buat layout dashboard
- Buat halaman CRUD utama
- Buat axios instance dengan interceptor token
- Buat protected route
- Buat login flow
- Buat reusable table, form input, badge, card, dan modal
- Pastikan aplikasi bisa berjalan lokal

21. Prioritas Pengerjaan
Kerjakan secara bertahap:

Tahap 1:
- Setup backend NestJS
- Setup Prisma + Neon PostgreSQL
- Auth JWT
- RBAC
- User module
- Vehicle module

Tahap 2:
- Odometer tracking
- Maintenance schedule
- Maintenance history
- Vehicle documents

Tahap 3:
- Expenses
- Driver assignment
- Damage report / work order

Tahap 4:
- Reports
- Dashboard analytics
- Frontend full integration

22. Catatan Penting
Jangan hanya membuat UI dummy.
Pastikan frontend benar-benar terhubung ke backend.
Pastikan semua endpoint menggunakan validasi DTO.
Pastikan semua route penting diproteksi JWT.
Pastikan role guard berjalan.
Pastikan error handling rapi.
Pastikan response API konsisten.

Gunakan format response API seperti ini:

{
  "status": "success",
  "message": "Data berhasil diproses",
  "data": {}
}

Jika error:

{
  "status": "error",
  "message": "Pesan error"
}

Buat kode yang rapi, readable, scalable, dan cocok sebagai portfolio fullstack.