import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

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

 await Promise.all(
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

  console.log("Seed selesai:", {
    roles: roles.length,
    modules: modules.length,
    departments: departments.length,
    users: seedUsers.length,
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
