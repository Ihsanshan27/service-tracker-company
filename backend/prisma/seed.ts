import { PrismaClient, UserRole, VehicleStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding...');

  // 1. Cleanup existing database
  await prisma.systemSetting.deleteMany({});
  await prisma.odometerLog.deleteMany({});
  await prisma.vehicleDocument.deleteMany({});
  await prisma.vehicleExpense.deleteMany({});
  await prisma.driverAssignment.deleteMany({});
  await prisma.damageReport.deleteMany({});
  await prisma.maintenanceHistory.deleteMany({});
  await prisma.maintenanceSchedule.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // Create Default Settings
  await prisma.systemSetting.create({
    data: {
      key: 'registration_enabled',
      value: 'true',
    },
  });

  console.log('Default settings seeded.');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin Utama',
      email: 'admin@example.com',
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      phone: '081234567890',
      isActive: true,
    },
  });

  const fleetManager = await prisma.user.create({
    data: {
      name: 'Fleet Manager Budi',
      email: 'manager@example.com',
      password: passwordHash,
      role: UserRole.FLEET_MANAGER,
      phone: '081234567891',
      isActive: true,
    },
  });

  const mechanic = await prisma.user.create({
    data: {
      name: 'Mechanic Joko',
      email: 'mechanic@example.com',
      password: passwordHash,
      role: UserRole.MECHANIC,
      phone: '081234567892',
      isActive: true,
    },
  });

  const driver = await prisma.user.create({
    data: {
      name: 'Driver Slamet',
      email: 'driver@example.com',
      password: passwordHash,
      role: UserRole.DRIVER,
      phone: '081234567893',
      isActive: true,
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: 'Finance Ani',
      email: 'finance@example.com',
      password: passwordHash,
      role: UserRole.FINANCE,
      phone: '081234567894',
      isActive: true,
    },
  });

  console.log('Users seeded:', {
    superAdmin: superAdmin.email,
    fleetManager: fleetManager.email,
    mechanic: mechanic.email,
    driver: driver.email,
    finance: finance.email,
  });

  // 3. Create Vehicles
  const vehiclesData = [
    {
      plateNumber: 'B 1234 ABC',
      brand: 'Toyota',
      model: 'Avanza',
      year: 2021,
      color: 'Hitam',
      vehicleType: 'MPV',
      fuelType: 'Pertalite',
      transmission: 'Manual',
      chassisNumber: 'MHF11BK38L234567',
      engineNumber: '1NR-VE823456',
      currentOdometer: 45000,
      status: VehicleStatus.ACTIVE,
      purchaseDate: new Date('2021-06-15'),
      notes: 'Kendaraan operasional tim lapangan',
    },
    {
      plateNumber: 'B 5678 DEF',
      brand: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Putih',
      vehicleType: 'Sedan',
      fuelType: 'Pertamax',
      transmission: 'Otomatis',
      chassisNumber: 'MHF22CK38L789012',
      engineNumber: 'L15B7989012',
      currentOdometer: 25000,
      status: VehicleStatus.ACTIVE,
      purchaseDate: new Date('2022-03-10'),
      notes: 'Kendaraan dinas Direksi',
    },
    {
      plateNumber: 'B 9012 GHI',
      brand: 'Mitsubishi',
      model: 'L300 Pick Up',
      year: 2020,
      color: 'Hitam',
      vehicleType: 'Pick Up',
      fuelType: 'Solar',
      transmission: 'Manual',
      chassisNumber: 'MHF33DK38L123000',
      engineNumber: '4D56876543',
      currentOdometer: 85000,
      status: VehicleStatus.MAINTENANCE,
      purchaseDate: new Date('2020-01-20'),
      notes: 'Kendaraan logistik barang berat',
    },
    {
      plateNumber: 'B 3456 JKL',
      brand: 'Toyota',
      model: 'Hiace',
      year: 2019,
      color: 'Silver',
      vehicleType: 'Minibus',
      fuelType: 'Solar',
      transmission: 'Manual',
      chassisNumber: 'MHF44EK38L456789',
      engineNumber: '1GD-FTV987654',
      currentOdometer: 120000,
      status: VehicleStatus.ACTIVE,
      purchaseDate: new Date('2019-11-05'),
      notes: 'Minibus operasional antar jemput karyawan',
    },
    {
      plateNumber: 'B 7890 MNO',
      brand: 'Suzuki',
      model: 'Carry Pick Up',
      year: 2023,
      color: 'Abu-abu',
      vehicleType: 'Pick Up',
      fuelType: 'Pertalite',
      transmission: 'Manual',
      chassisNumber: 'MHF55FK38L012345',
      engineNumber: 'K15B912345',
      currentOdometer: 12000,
      status: VehicleStatus.ACTIVE,
      purchaseDate: new Date('2023-08-18'),
      notes: 'Kendaraan operasional kurir dokumen',
    },
    {
      plateNumber: 'B 4321 XYZ',
      brand: 'Honda',
      model: 'Vario 160',
      year: 2023,
      color: 'Hitam Doff',
      vehicleType: 'Motorcycle',
      fuelType: 'Pertamax',
      transmission: 'Otomatis',
      chassisNumber: 'MHF66GK38L543210',
      engineNumber: 'K2FA9154321',
      currentOdometer: 8500,
      status: VehicleStatus.ACTIVE,
      purchaseDate: new Date('2023-11-12'),
      notes: 'Sepeda motor operasional kurir pengantar surat / dokumen internal',
    },
  ];

  for (const vData of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: vData,
    });

    await prisma.odometerLog.create({
      data: {
        vehicleId: vehicle.id,
        userId: superAdmin.id,
        odometer: vehicle.currentOdometer,
        date: vehicle.purchaseDate,
        notes: 'Odometer awal saat inisialisasi sistem',
      },
    });
  }

  console.log('Vehicles and initial odometer logs seeded.');

  const createdVehicles = await prisma.vehicle.findMany();
  
  const avanza = createdVehicles.find(v => v.plateNumber === 'B 1234 ABC')!;
  const civic = createdVehicles.find(v => v.plateNumber === 'B 5678 DEF')!;
  const pickUp = createdVehicles.find(v => v.plateNumber === 'B 9012 GHI')!;
  
  console.log('Seeding Maintenance Schedules...');
  await prisma.maintenanceSchedule.create({
    data: {
      vehicleId: avanza.id,
      title: 'Ganti Oli Mesin Avanza',
      description: 'Ganti oli rutin 10.000 km',
      maintenanceType: 'OIL_CHANGE',
      intervalKm: 10000,
      intervalMonth: 6,
      lastServiceDate: new Date('2026-01-10'),
      lastServiceOdometer: 40000,
      nextServiceDate: new Date('2026-07-10'),
      nextServiceOdometer: 50000,
      status: 'UPCOMING',
    }
  });

  const soonDate = new Date();
  soonDate.setDate(soonDate.getDate() + 3);
  await prisma.maintenanceSchedule.create({
    data: {
      vehicleId: civic.id,
      title: 'Service AC Civic',
      description: 'Pembersihan evaporator dan tambah freon',
      maintenanceType: 'SERVICE',
      intervalKm: 20000,
      intervalMonth: 12,
      lastServiceDate: new Date('2025-05-30'),
      lastServiceOdometer: 10000,
      nextServiceDate: soonDate,
      nextServiceOdometer: 30000,
      status: 'DUE_SOON',
    }
  });

  await prisma.maintenanceSchedule.create({
    data: {
      vehicleId: pickUp.id,
      title: 'Ganti Ban Depan L300',
      description: 'Ban sudah aus sebelah kanan',
      maintenanceType: 'TIRE_CHANGE',
      intervalKm: 40000,
      intervalMonth: 24,
      lastServiceDate: new Date('2024-05-15'),
      lastServiceOdometer: 40000,
      nextServiceDate: new Date('2026-05-15'),
      nextServiceOdometer: 80000,
      status: 'OVERDUE',
    }
  });

  console.log('Seeding Vehicle Documents...');
  const activeDate = new Date();
  activeDate.setFullYear(activeDate.getFullYear() + 1);
  await prisma.vehicleDocument.create({
    data: {
      vehicleId: avanza.id,
      documentType: 'STNK',
      documentNumber: 'STNK-AVZ-2021',
      issueDate: new Date('2021-06-15'),
      expiryDate: activeDate,
      provider: 'SAMSAT Jakarta',
      cost: 3200000,
      notes: 'Pajak 5 Tahunan aman',
    }
  });

  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 10);
  await prisma.vehicleDocument.create({
    data: {
      vehicleId: civic.id,
      documentType: 'KIR',
      documentNumber: 'KIR-CVC-2022',
      issueDate: new Date('2022-03-10'),
      expiryDate: expiredDate,
      provider: 'DISHUB DKI',
      cost: 250000,
      notes: 'Harus segera diuji kelayakan',
    }
  });

  const soonExpDate = new Date();
  soonExpDate.setDate(soonExpDate.getDate() + 15);
  await prisma.vehicleDocument.create({
    data: {
      vehicleId: pickUp.id,
      documentType: 'TAX',
      documentNumber: 'TAX-L300-2020',
      issueDate: new Date('2020-01-20'),
      expiryDate: soonExpDate,
      provider: 'SAMSAT Depok',
      cost: 2800000,
      notes: 'Pajak tahunan masuk budget bulan ini',
    }
  });

  console.log('Seeding Maintenance Histories...');
  await prisma.maintenanceHistory.create({
    data: {
      vehicleId: avanza.id,
      maintenanceType: 'GENERAL_CHECK',
      title: 'Tune Up Avanza',
      description: 'Tune up mesin, ganti busi dan filter udara',
      serviceDate: new Date('2026-01-10'),
      odometerAtService: 40000,
      workshopName: 'Toyota Auto2000',
      cost: 1500000,
      status: 'COMPLETED',
      notes: 'Mesin kembali prima, tarikan enteng',
      performedBy: mechanic.id,
    }
  });

  console.log('Seeding completed successfully! 🎉');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
