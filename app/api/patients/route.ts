import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseNumber(value: string | null, fallback: number) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = Math.min(parseNumber(searchParams.get("limit"), 20), 100);

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { nationalId: { contains: search, mode: "insensitive" as const } },
          { upi: { contains: search, mode: "insensitive" as const } }
        ]
      }
    : undefined;

  const [data, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.patient.count({ where })
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      sex,
      dateOfBirth,
      upi,
      nationalId,
      passport,
      phone,
      address,
      nextOfKin,
      facilityId
    } = body ?? {};

    if (!firstName || !lastName || !sex || !dateOfBirth) {
      return NextResponse.json({ error: "Missing required patient fields" }, { status: 400 });
    }

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json({ error: "Invalid dateOfBirth" }, { status: 400 });
    }

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        sex,
        dateOfBirth: dob,
        upi: upi ?? null,
        nationalId: nationalId ?? null,
        passport: passport ?? null,
        phone: phone ?? null,
        address: address ?? null,
        nextOfKin: nextOfKin ?? null,
        facilityId: facilityId ?? null
      }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
