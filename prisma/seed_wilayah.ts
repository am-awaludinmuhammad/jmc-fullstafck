import "dotenv/config";
import { prisma } from "../lib/prisma";

export const provinces = [
  { id: 1, code: "34", name: "D.I. Yogyakarta" },
  { id: 2, code: "33", name: "Jawa Tengah" },
  { id: 3, code: "35", name: "Jawa Timur" },
  { id: 4, code: "32", name: "Jawa Barat" },
  { id: 5, code: "31", name: "DKI Jakarta" },
]

export const regencies = [
  { id: 1, provinceId: 1, code: "3402", name: "Bantul" },
  { id: 2, provinceId: 1, code: "3404", name: "Sleman" },
  { id: 3, provinceId: 1, code: "3403", name: "Gunung Kidul" },
  { id: 4, provinceId: 1, code: "3401", name: "Kulon Progo" },
  { id: 5, provinceId: 1, code: "3471", name: "Yogyakarta" },
]

export const districts = [
  { id: 1, regencyId: 5, code: "347101", name: "Danurejan" },
  { id: 2, regencyId: 5, code: "347102", name: "Gedongtengen" },
  { id: 3, regencyId: 5, code: "347103", name: "Gondokusuman" },
  { id: 4, regencyId: 5, code: "347104", name: "Jetis" },
  { id: 5, regencyId: 1, code: "340201", name: "Kasihan" },
]

async function main() {

  // Province
  await Promise.all(
    provinces.map((province) =>
      prisma.province.upsert({
        where: { code: province.code },
        update: {
          name: province.name,
        },
        create: {
          code: province.code,
          name: province.name,
        },
      })
    )
  );

  // Regency
  await Promise.all(
    regencies.map(async (regency) => {
      const province = provinces.find((p) => p.id === regency.provinceId)!;

      await prisma.regency.upsert({
        where: { code: regency.code },
        update: {
          name: regency.name,
          provinceId: (
            await prisma.province.findUniqueOrThrow({
              where: { code: province.code },
            })
          ).id,
        },
        create: {
          code: regency.code,
          name: regency.name,
          provinceId: (
            await prisma.province.findUniqueOrThrow({
              where: { code: province.code },
            })
          ).id,
        },
      });
    })
  );

  // District
  await Promise.all(
    districts.map(async (district) => {
      const regency = regencies.find((r) => r.id === district.regencyId)!;

      await prisma.district.upsert({
        where: { code: district.code },
        update: {
          name: district.name,
          regencyId: (
            await prisma.regency.findUniqueOrThrow({
              where: { code: regency.code },
            })
          ).id,
        },
        create: {
        code: district.code,
        name: district.name,
        regencyId: (
          await prisma.regency.findUniqueOrThrow({
            where: { code: regency.code },
          })
        ).id,
      },
    });
  })
);

}


main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
