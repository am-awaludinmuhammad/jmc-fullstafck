import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";
import {
  KUOTA_CUTI_PER_BULAN,
  KUOTA_IZIN_PER_BULAN,
  KUOTA_UNPAID_LEAVE_PER_BULAN,
  MINIMAL_HARI_HADIR_TERPENUHI,
} from "../lib/attendance/constants";

type ScopeCode = "no" | "all" | "own";

type PermissionInput = {
  moduleCode: string;
  canAccess: boolean;
  canCreate: boolean;
  readScope: ScopeCode;
  updateScope: ScopeCode;
  deleteScope: ScopeCode;
};

const NO_ACCESS: Omit<PermissionInput, "moduleCode"> = {
  canAccess: false,
  canCreate: false,
  readScope: "no",
  updateScope: "no",
  deleteScope: "no",
};

async function main() {
  const roles = await Promise.all(
    [
      { code: "SPR", name: "Superadmin", description: "Akses penuh ke seluruh modul" },
      { code: "MGRHRD", name: "Manager HRD", description: "Mengawasi operasional HRD" },
      { code: "ADMHRD", name: "Admin HRD", description: "Mengelola data operasional HRD" },
    ].map((role) =>
      prisma.role.upsert({ where: { code: role.code }, update: role, create: role })
    )
  );

  const modules = await Promise.all(
    [
      { code: "KELOLA_ROLE", name: "Kelola Role", description: "Melihat privilege role (RBAC)", sortOrder: 1 },
      { code: "KELOLA_USER", name: "Kelola User", description: "Mengelola akun pengguna aplikasi", sortOrder: 2 },
      { code: "MY_PROFILE", name: "My Profile", description: "Profil milik pengguna yang sedang login", sortOrder: 3 },
      { code: "DASHBOARD", name: "Dashboard", description: "Ringkasan data sesuai role", sortOrder: 4 },
      { code: "DATA_PEGAWAI", name: "Modul Data Pegawai", description: "Data kepegawaian", sortOrder: 5 },
      { code: "PRESENSI", name: "Modul Presensi", description: "Data kehadiran pegawai", sortOrder: 6 },
      { code: "TUNJANGAN_TRANSPORT", name: "Modul Tunjangan Transport", description: "Rekap tunjangan transport per periode", sortOrder: 7 },
      { code: "SETTING_TUNJANGAN", name: "Setting Tunjangan Transport", description: "Konfigurasi tarif tunjangan transport", sortOrder: 8 },
      { code: "LOG", name: "Modul Log", description: "Log aktivitas pengguna", sortOrder: 9 },
    ].map((mod) =>
      prisma.module.upsert({ where: { code: mod.code }, update: mod, create: mod })
    )
  );

  const roleByCode = Object.fromEntries(roles.map((role) => [role.code, role]));
  const moduleByCode = Object.fromEntries(modules.map((mod) => [mod.code, mod]));

  const permissionsByRole: Record<string, PermissionInput[]> = {
    SPR: [
      { moduleCode: "KELOLA_ROLE", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { moduleCode: "KELOLA_USER", canAccess: true, canCreate: true, readScope: "all", updateScope: "all", deleteScope: "all" },
      { moduleCode: "MY_PROFILE", canAccess: true, canCreate: false, readScope: "own", updateScope: "own", deleteScope: "no" },
      { moduleCode: "DASHBOARD", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { ...NO_ACCESS, moduleCode: "DATA_PEGAWAI" },
      { ...NO_ACCESS, moduleCode: "PRESENSI" },
      { ...NO_ACCESS, moduleCode: "TUNJANGAN_TRANSPORT" },
      { ...NO_ACCESS, moduleCode: "SETTING_TUNJANGAN" },
      { moduleCode: "LOG", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
    ],
    MGRHRD: [
      { ...NO_ACCESS, moduleCode: "KELOLA_ROLE" },
      { ...NO_ACCESS, moduleCode: "KELOLA_USER" },
      { moduleCode: "MY_PROFILE", canAccess: true, canCreate: false, readScope: "own", updateScope: "own", deleteScope: "no" },
      { moduleCode: "DASHBOARD", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { moduleCode: "DATA_PEGAWAI", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { moduleCode: "PRESENSI", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { moduleCode: "TUNJANGAN_TRANSPORT", canAccess: true, canCreate: false, readScope: "own", updateScope: "no", deleteScope: "no" },
      { ...NO_ACCESS, moduleCode: "SETTING_TUNJANGAN" },
      { ...NO_ACCESS, moduleCode: "LOG" },
    ],
    ADMHRD: [
      { ...NO_ACCESS, moduleCode: "KELOLA_ROLE" },
      { ...NO_ACCESS, moduleCode: "KELOLA_USER" },
      { moduleCode: "MY_PROFILE", canAccess: true, canCreate: false, readScope: "own", updateScope: "own", deleteScope: "no" },
      { moduleCode: "DASHBOARD", canAccess: true, canCreate: false, readScope: "all", updateScope: "no", deleteScope: "no" },
      { moduleCode: "DATA_PEGAWAI", canAccess: true, canCreate: true, readScope: "all", updateScope: "all", deleteScope: "all" },
      { moduleCode: "PRESENSI", canAccess: true, canCreate: true, readScope: "all", updateScope: "all", deleteScope: "all" },
      { moduleCode: "TUNJANGAN_TRANSPORT", canAccess: true, canCreate: false, readScope: "own", updateScope: "no", deleteScope: "no" },
      { moduleCode: "SETTING_TUNJANGAN", canAccess: true, canCreate: true, readScope: "all", updateScope: "all", deleteScope: "all" },
      { ...NO_ACCESS, moduleCode: "LOG" },
    ],
  };

  for (const [roleCode, permissions] of Object.entries(permissionsByRole)) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_moduleId: {
            roleId: roleByCode[roleCode].id,
            moduleId: moduleByCode[permission.moduleCode].id,
          },
        },
        update: {
          canAccess: permission.canAccess,
          canCreate: permission.canCreate,
          readScope: permission.readScope,
          updateScope: permission.updateScope,
          deleteScope: permission.deleteScope,
        },
        create: {
          roleId: roleByCode[roleCode].id,
          moduleId: moduleByCode[permission.moduleCode].id,
          canAccess: permission.canAccess,
          canCreate: permission.canCreate,
          readScope: permission.readScope,
          updateScope: permission.updateScope,
          deleteScope: permission.deleteScope,
        },
      });
    }
  }

  const departments = await Promise.all(
    [
      { code: "MKT", name: "Marketing" },
      { code: "HRD", name: "HRD" },
      { code: "PRD", name: "Production" },
      { code: "EXE", name: "Executive" },
      { code: "COM", name: "Commissioner" },
    ].map((dept) =>
      prisma.department.upsert({
        where: { code: dept.code },
        update: dept,
        create: dept,
      })
    )
  );

  const positions = await Promise.all(
    [
      { code: "MGR", name: "Manager", positionType: "manager" as const },
      { code: "STF", name: "Staf", positionType: "staf" as const },
      { code: "MAG", name: "Magang", positionType: "staf" as const },
    ].map((pos) =>
      prisma.position.upsert({
        where: { code: pos.code },
        update: pos,
        create: pos,
      })
    )
  );

  const positionByCode = Object.fromEntries(positions.map((p) => [p.code, p]));
  const departmentByCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  const defaultPassword = await hashPassword("Password123!");

  const seedUsers = [
    { username: "testadmin", name: "Test Admin", email: "testadmin@example.com", cellphone: "081234567890", status: "active" as const, roleCode: "SPR" },
    { username: "ahmad", name: "Ahmad Hendarto", email: "ahmad@email.com", cellphone: "081234567801", status: "active" as const, roleCode: "ADMHRD" },
    { username: "riko", name: "Riko Salim", email: "riko.salim@email.com", cellphone: "081234567802", status: "active" as const, roleCode: "ADMHRD" },
    { username: "dhea", name: "Dhea Angela", email: "dhea.angela@email.com", cellphone: "081234567803", status: "inactive" as const, roleCode: "ADMHRD" },
    { username: "shani", name: "Shani Ratnasari", email: "shani.ratnasari@email.com", cellphone: "081234567804", status: "active" as const, roleCode: "MGRHRD" },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        status: user.status,
        roleId: roleByCode[user.roleCode].id,
      },
      create: {
        username: user.username,
        name: user.name,
        email: user.email,
        cellphone: user.cellphone,
        password: defaultPassword,
        status: user.status,
        roleId: roleByCode[user.roleCode].id,
      },
    });
  }

  const district = await prisma.district.findFirst();

  let seedEmployees: { nip: string }[] = [];
  let attendanceSummaryCount = 0;
  let transportSettingCreated = false;

  if (!district) {
    console.warn(
      "Skip seed pegawai/tunjangan: belum ada data wilayah (Province/Regency/District). Import data wilayah dulu, lalu jalankan ulang seed."
    );
  } else {
    const employeeSeeds = [
      {
        nip: "90000001",
        name: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "+6281300000001",
        employmentType: "pkwtt" as const,
        distanceKm: 12.5,
        hadir: 22,
        note: "Pegawai tetap, jarak normal, hari kerja cukup -> berhak tunjangan",
      },
      {
        nip: "90000002",
        name: "Siti Aminah",
        email: "siti.aminah@example.com",
        phone: "+6281300000002",
        employmentType: "pkwtt" as const,
        distanceKm: 30,
        hadir: 20,
        note: "Jarak melebihi maksimal setting -> km dipotong ke batas maksimal",
      },
      {
        nip: "90000003",
        name: "Joko Susilo",
        email: "joko.susilo@example.com",
        phone: "+6281300000003",
        employmentType: "pkwtt" as const,
        distanceKm: 4,
        hadir: 25,
        note: "Jarak di bawah minimal setting -> tidak berhak tunjangan",
      },
      {
        nip: "90000004",
        name: "Rina Wulandari",
        email: "rina.wulandari@example.com",
        phone: "+6281300000004",
        employmentType: "pkwt" as const,
        distanceKm: 10,
        hadir: 25,
        note: "Bukan pegawai tetap -> tidak berhak tunjangan",
      },
      {
        nip: "90000005",
        name: "Agus Salim",
        email: "agus.salim@example.com",
        phone: "+6281300000005",
        employmentType: "pkwtt" as const,
        distanceKm: 8,
        hadir: 15,
        note: "Hari masuk kerja di bawah minimal -> tidak berhak tunjangan",
      },
    ];

    for (const seed of employeeSeeds) {
      await prisma.employee.upsert({
        where: { nip: seed.nip },
        update: {
          name: seed.name,
          employmentType: seed.employmentType,
          distanceKm: seed.distanceKm,
        },
        create: {
          nip: seed.nip,
          name: seed.name,
          email: seed.email,
          phone: seed.phone,
          birthPlace: "Yogyakarta",
          birthDate: new Date("1995-01-01"),
          maritalStatus: "tidak kawin",
          childrenCount: 0,
          joinedAt: new Date("2024-01-01"),
          positionId: positionByCode["STF"].id,
          departmentId: departmentByCode["HRD"].id,
          employmentType: seed.employmentType,
          gender: "Laki-laki",
          distanceKm: seed.distanceKm,
          districtId: district.id,
          fullAddress: "Alamat data uji coba, diisi seeder",
          status: "active",
        },
      });
    }

    seedEmployees = employeeSeeds;

    const now = new Date();
    const periodYear = now.getFullYear();
    const periodMonth = now.getMonth() + 1;

    for (const seed of employeeSeeds) {
      const employee = await prisma.employee.findUniqueOrThrow({ where: { nip: seed.nip } });

      await prisma.attendanceSummary.upsert({
        where: {
          employeeId_periodYear_periodMonth: {
            employeeId: employee.id,
            periodYear,
            periodMonth,
          },
        },
        update: {
          hadir: seed.hadir,
          statusHadir: seed.hadir >= MINIMAL_HARI_HADIR_TERPENUHI ? "Terpenuhi" : "Tidak Terpenuhi",
        },
        create: {
          employeeId: employee.id,
          periodYear,
          periodMonth,
          hadir: seed.hadir,
          cuti: 0,
          kuotaCuti: KUOTA_CUTI_PER_BULAN,
          izin: 0,
          kuotaIzin: KUOTA_IZIN_PER_BULAN,
          unpaidLeave: 0,
          kuotaUnpaidLeave: KUOTA_UNPAID_LEAVE_PER_BULAN,
          statusHadir: seed.hadir >= MINIMAL_HARI_HADIR_TERPENUHI ? "Terpenuhi" : "Tidak Terpenuhi",
          calculatedAt: new Date(),
        },
      });
      attendanceSummaryCount += 1;
    }

    const existingSetting = await prisma.transportAllowanceSetting.findFirst();
    if (!existingSetting) {
      await prisma.transportAllowanceSetting.create({
        data: {
          baseFare: 15000,
          effectiveStart: new Date("2026-01-01"),
          minKm: 5,
          maxKm: 25,
          isActive: true,
        },
      });
      transportSettingCreated = true;
    }
  }

  console.log("Seed selesai:", {
    roles: roles.length,
    modules: modules.length,
    departments: departments.length,
    users: seedUsers.length,
    employeesUntukTunjangan: seedEmployees.length,
    attendanceSummary: attendanceSummaryCount,
    transportSettingCreated,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
