import {
  JAM_MASUK,
  JAM_ISTIRAHAT_MULAI,
  JAM_ISTIRAHAT_SELESAI,
  TOLERANSI_TELAT_MENIT,
  MINIMAL_JAM_KERJA,
  MINIMAL_HARI_HADIR_TERPENUHI,
} from "./constants";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesOfDay(date: Date) {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function calculateHadirRow({
  checkinAt,
  checkoutAt,
  checkinLocation,
  checkoutLocation,
}: {
  checkinAt: Date;
  checkoutAt: Date;
  checkinLocation: string;
  checkoutLocation: string;
}) {
  if (checkinLocation !== checkoutLocation) {
    return {
      durationHours: 0,
      status: "tidak_terpenuhi" as const,
      hadirCredit: 0,
      note: "Checkin dan checkout beda lokasi, tidak dihitung masuk",
    };
  }

  const breakStart = timeToMinutes(JAM_ISTIRAHAT_MULAI);
  const breakEnd = timeToMinutes(JAM_ISTIRAHAT_SELESAI);
  const checkinMinutes = minutesOfDay(checkinAt);
  const checkoutMinutes = minutesOfDay(checkoutAt);

  const overlapStart = Math.max(checkinMinutes, breakStart);
  const overlapEnd = Math.min(checkoutMinutes, breakEnd);
  const breakOverlapMinutes = Math.max(0, overlapEnd - overlapStart);

  const workedMinutes = Math.max(0, checkoutMinutes - checkinMinutes - breakOverlapMinutes);
  const durationHours = Math.round((workedMinutes / 60) * 10) / 10;

  const lateMinutes = Math.max(0, checkinMinutes - timeToMinutes(JAM_MASUK));

  if (lateMinutes <= TOLERANSI_TELAT_MENIT) {
    return {
      durationHours,
      status: "terpenuhi" as const,
      hadirCredit: 1,
      note: null,
    };
  }

  if (durationHours < MINIMAL_JAM_KERJA) {
    return {
      durationHours,
      status: "tidak_terpenuhi" as const,
      hadirCredit: 0,
      note: `Terlambat ${lateMinutes} menit dan durasi kerja ${durationHours} jam, kurang dari minimal ${MINIMAL_JAM_KERJA} jam`,
    };
  }

  return {
    durationHours,
    status: "terpenuhi" as const,
    hadirCredit: 0.5,
    note: `Terlambat ${lateMinutes} menit, dihitung setengah hari`,
  };
}

export function statusHadirBulan(hadir: number) {
  return hadir >= MINIMAL_HARI_HADIR_TERPENUHI ? "Terpenuhi" : "Tidak Terpenuhi";
}
