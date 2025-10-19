import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const pending = await prisma.labTest.findMany({
    where: { status: { in: ["ORDERED", "RECEIVED"] } },
    include: {
      orderItem: {
        include: {
          order: {
            include: {
              visit: {
                select: {
                  id: true,
                  patient: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      orderItem: {
        order: {
          createdAt: "desc"
        }
      }
    }
  });

  return NextResponse.json(pending);
}
