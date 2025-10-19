import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: { visitId: string } }) {
  const visitId = params.visitId;

  if (!visitId) {
    return NextResponse.json({ error: "Visit ID missing" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const vital = await prisma.vital.create({
      data: {
        visitId,
        heightCm: body.heightCm ?? null,
        weightKg: body.weightKg ?? null,
        temperatureC: body.temperatureC ?? null,
        pulseBpm: body.pulseBpm ?? null,
        systolic: body.systolic ?? null,
        diastolic: body.diastolic ?? null,
        spo2: body.spo2 ?? null
      }
    });

    return NextResponse.json(vital, { status: 201 });
  } catch (error) {
    console.error(`POST /api/visits/${visitId}/vitals`, error);
    return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 });
  }
}
