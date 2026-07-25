import { MINIMAL_HARI_HADIR_TERPENUHI } from "@/lib/attendance/constants";

export function calculateTunjanganTransport({
  employmentType,
  distanceKm,
  hadir,
  baseFare,
  minKm,
  maxKm,
}: {
  employmentType: string;
  distanceKm: number;
  hadir: number;
  baseFare: number;
  minKm: number;
  maxKm: number;
}) {
  if (employmentType !== "pkwtt") {
    return { eligible: false as const, reason: "Bukan pegawai tetap" };
  }

  if (hadir < MINIMAL_HARI_HADIR_TERPENUHI) {
    return { eligible: false as const, reason: `Hari masuk kerja ${hadir} kurang dari minimal ${MINIMAL_HARI_HADIR_TERPENUHI} hari` };
  }

  const roundedKm = Math.round(distanceKm);

  if (roundedKm <= minKm) {
    return { eligible: false as const, reason: `Jarak ${roundedKm} km, tidak lebih dari minimal ${minKm} km` };
  }

  const cappedKm = Math.min(roundedKm, maxKm);
  const nominal = baseFare * cappedKm * hadir;

  return {
    eligible: true as const,
    originalKm: distanceKm,
    roundedKm: cappedKm,
    nominal,
  };
}
