import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireEmployeePermission } from "@/lib/auth/authorize-employee";
import { parseEmployeeFormData, savePhoto } from "@/lib/employees/parse-form";
import { validateEmployeeForm } from "@/lib/employees/validate";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { allowed, payload } = await requireEmployeePermission(request, "update");
  if (!allowed || !payload) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const data = await parseEmployeeFormData(formData);

  const validationError = validateEmployeeForm(data);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const photoPath = data.photoFile ? await savePhoto(data.photoFile) : undefined;

  try {
    await prisma.$transaction([
      prisma.employeeEducation.deleteMany({ where: { employeeId: Number(id) } }),
      prisma.employee.update({
        where: { id: Number(id) },
        data: {
          nip: data.nip,
          name: data.name,
          email: data.email,
          phone: data.phone,
          ...(photoPath ? { photoPath } : {}),
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          maritalStatus: data.maritalStatus,
          childrenCount: data.childrenCount,
          joinedAt: new Date(data.joinedAt),
          positionId: data.positionId,
          departmentId: data.departmentId,
          employmentType: data.employmentType as "pkwtt" | "pkwt" | "magang",
          gender: data.gender,
          distanceKm: data.distanceKm,
          districtId: data.districtId,
          fullAddress: data.fullAddress,
          status: data.status as "active" | "inactive",
          updatedBy: payload.userId,
          educations: {
            create: data.educations.map((edu, index) => ({
              educationLevel: edu.educationLevel,
              schoolName: edu.schoolName,
              graduationYear: edu.graduationYear,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "NIP atau email sudah dipakai" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requireEmployeePermission(request, "delete");
  if (!allowed) {
    return NextResponse.json({ error: "Tidak punya akses" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.employee.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
