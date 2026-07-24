import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "pegawai");

export type EmployeeEducationInput = {
  educationLevel: string;
  schoolName: string;
  graduationYear: number;
};

export type EmployeeFormData = {
  nip: string;
  name: string;
  email: string;
  phone: string;
  birthPlace: string;
  birthDate: string;
  maritalStatus: string;
  childrenCount: number;
  joinedAt: string;
  positionId: number;
  departmentId: number;
  employmentType: string;
  gender: string;
  distanceKm: number;
  districtId: number;
  fullAddress: string;
  status: string;
  educations: EmployeeEducationInput[];
  photoFile: File | null;
};

export async function parseEmployeeFormData(formData: FormData): Promise<EmployeeFormData> {
  const get = (key: string) => (formData.get(key) as string) ?? "";

  const educationsRaw = get("educations");
  const educations: EmployeeEducationInput[] = educationsRaw ? JSON.parse(educationsRaw) : [];

  const photo = formData.get("photo");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;

  return {
    nip: get("nip"),
    name: get("name"),
    email: get("email"),
    phone: get("phone"),
    birthPlace: get("birthPlace"),
    birthDate: get("birthDate"),
    maritalStatus: get("maritalStatus"),
    childrenCount: Number(get("childrenCount") || 0),
    joinedAt: get("joinedAt"),
    positionId: Number(get("positionId")),
    departmentId: Number(get("departmentId")),
    employmentType: get("employmentType"),
    gender: get("gender"),
    distanceKm: Number(get("distanceKm") || 0),
    districtId: Number(get("districtId")),
    fullAddress: get("fullAddress"),
    status: get("status") === "inactive" ? "inactive" : "active",
    educations,
    photoFile,
  };
}

export async function savePhoto(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/pegawai/${filename}`;
}
