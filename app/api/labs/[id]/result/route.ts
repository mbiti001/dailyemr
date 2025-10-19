import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type ResultBody = {
  result?: string | null;
  resultCode?: string | null;
  status?: string;
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Lab test id missing" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ResultBody;
    const status = body.status ?? "COMPLETE";

    const updated = await prisma.labTest.update({
      where: { id },
      data: {
        result: body.result ?? null,
        resultCode: body.resultCode ?? null,
        status,
        analyzedAt: status === "COMPLETE" ? new Date() : null
      },
      include: {
        orderItem: {
          include: {
            order: {
              include: {
                items: {
                  include: { labTest: true }
                }
              }
            }
          }
        }
      }
    });

    const order = updated.orderItem.order;
    const allComplete = order.items.every(
      (item: (typeof order.items)[number]) => item.labTest?.status === "COMPLETE"
    );

    if (allComplete && order.status !== "COMPLETE") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETE" }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`POST /api/labs/${id}/result`, error);
    return NextResponse.json({ error: "Failed to submit result" }, { status: 500 });
  }
}
