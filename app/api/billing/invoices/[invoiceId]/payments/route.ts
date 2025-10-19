import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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
    const method = (body?.method as string | undefined)?.toUpperCase() ?? "CASH";
    const amount = Number(body?.amount ?? 0);

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive integer" }, { status: 400 });
    }

    const ref = (body?.ref as string | undefined)?.trim() ?? null;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId,
          method,
          amount,
          ref
        }
      });

      const aggregate = await tx.payment.aggregate({
        where: { invoiceId },
        _sum: { amount: true }
      });

      const paid = aggregate._sum.amount ?? 0;
      const newStatus = paid >= invoice.total ? "PAID" : invoice.status;

      const latestInvoice =
        newStatus !== invoice.status
          ? await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } })
          : invoice;

      return { payment, invoice: latestInvoice, paid };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(`POST /api/billing/invoices/${invoiceId}/payments`, error);
    const status = error instanceof Error && error.message === "Invoice not found" ? 404 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to record payment" }, { status });
  }
}
