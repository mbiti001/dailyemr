import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, type, facilityId, providerId, notes } = body ?? {};

    if (!patientId || !type) {
      return NextResponse.json({ error: "patientId and type are required" }, { status: 400 });
    }

    const visit = await prisma.visit.create({
      data: {
        patientId,
        type,
        facilityId: facilityId ?? null,
        providerId: providerId ?? null,
        notes: notes ?? null
      }
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("POST /api/visits", error);
    return NextResponse.json({ error: "Failed to start visit" }, { status: 500 });
  }
}
