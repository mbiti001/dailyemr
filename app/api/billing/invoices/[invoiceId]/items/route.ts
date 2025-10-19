import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  const invoiceId = params.invoiceId;
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId missing" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const description = (body?.description as string | undefined)?.trim() ?? "Unnamed item";
    const amount = Number(body?.amount ?? 0);

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive integer" }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        total: { increment: amount },
        items: {
          create: {
            description,
            amount
          }
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error(`POST /api/billing/invoices/${invoiceId}/items`, error);
    return NextResponse.json({ error: "Failed to add invoice item" }, { status: 500 });
  }
}
