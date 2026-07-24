import { EmployeeFormData } from "@/lib/employees/parse-form";

export function validateEmployeeForm(data: EmployeeFormData): string | null {
  if (!/^\d{8,}$/.test(data.nip)) {
    return "NIP minimal 8 karakter dan hanya boleh angka";
  }

  if (!/^[a-zA-Z0-9' ]+$/.test(data.name)) {
    return "Nama pegawai hanya boleh huruf, angka, tanda petik atas, dan spasi";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return "Format email tidak valid";
  }

  if (!/^\+\d{8,15}$/.test(data.phone)) {
    return "Nomor HP harus format internasional, contoh: +6282218458888";
  }

  if (!data.birthPlace) {
    return "Tempat lahir wajib diisi";
  }

  if (!data.districtId) {
    return "Kecamatan wajib dipilih";
  }

  if (!data.fullAddress) {
    return "Alamat lengkap wajib diisi";
  }

  if (!Number.isFinite(data.distanceKm) || data.distanceKm < 0 || data.distanceKm > 99) {
    return "Jarak rumah-kantor maksimal 2 digit";
  }

  if (!data.birthDate) {
    return "Tanggal lahir wajib diisi";
  }

  if (data.maritalStatus !== "kawin" && data.maritalStatus !== "tidak kawin") {
    return "Status kawin wajib dipilih";
  }

  if (!Number.isFinite(data.childrenCount) || data.childrenCount < 0 || data.childrenCount > 99) {
    return "Jumlah anak maksimal 2 digit";
  }

  if (!data.joinedAt) {
    return "Tanggal masuk wajib diisi";
  }

  if (!data.positionId) {
    return "Jabatan wajib dipilih";
  }

  if (!data.departmentId) {
    return "Departemen wajib dipilih";
  }

  if (!["pkwtt", "pkwt", "magang"].includes(data.employmentType)) {
    return "Status kontrak wajib dipilih";
  }

  if (!data.gender) {
    return "Jenis kelamin wajib dipilih";
  }

  return null;
}
