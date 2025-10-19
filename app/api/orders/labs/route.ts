import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LabOrderItemInput = {
  code: string;
  name: string;
  quantity?: number;
  specimen?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      visitId?: string;
      items?: LabOrderItemInput[];
    };

    if (!body?.visitId) {
      return NextResponse.json({ error: "visitId is required" }, { status: 400 });
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Provide at least one lab item" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        visitId: body.visitId,
        type: "LAB",
        status: "PENDING",
        items: {
          create: items.map(item => ({
            code: item.code,
            name: item.name,
            quantity: item.quantity ?? 1,
            labTest: {
              create: {
                specimen: item.specimen ?? null
              }
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            labTest: true
          }
        }
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders/labs", error);
    return NextResponse.json({ error: "Failed to create lab order" }, { status: 500 });
  }
}
