import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, payer = "CASH" } = body ?? {};

    if (!visitId) {
      return NextResponse.json({ error: "visitId is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        visitId,
        payer
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/billing/invoices", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
