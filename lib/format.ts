export const formatDateID = (date: string | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTimeID = (date: string | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatTimeID = (date: string | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatRupiah = (value: number | string) => {
  const number = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const masaKerja = (joinedAt: string | Date) => {
  const start = new Date(joinedAt);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return `${Math.max(years, 0)} tahun`;
};

export const calculateAge = (birthDate: string | Date) => {
  const start = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return years;
};
