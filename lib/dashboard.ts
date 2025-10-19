import { prisma } from "@/lib/prisma";
import { eachDayOfInterval, format, startOfDay, startOfMonth, subDays, subHours, subMonths } from "date-fns";

export type DashboardStats = {
  totals: {
    patients: number;
    visitsAllTime: number;
    activeVisits: number;
    visitsToday: number;
  };
  revenue: {
    thisMonth: number;
    previousMonth: number;
    change: number;
    outstanding: number;
  };
  labs: {
    pending: number;
    completed24h: number;
  };
  visits: {
    lastSevenDays: number;
    previousSevenDays: number;
    change: number;
    trend: Array<{ date: string; label: string; count: number }>;
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const thisMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const lastSevenStart = subDays(todayStart, 6);
  const previousSevenStart = subDays(lastSevenStart, 7);

  const [
    totalPatients,
    visitsAllTime,
    activeVisits,
    visitsToday,
    invoicesAggregate,
    paymentsAggregate,
    pendingLabs,
    labsCompleted24h,
    paymentsThisMonthAggregate,
    paymentsPreviousMonthAggregate,
    visitsLastSeven,
    visitsPreviousSeven
  ] = await prisma.$transaction([
    prisma.patient.count(),
    prisma.visit.count(),
    prisma.visit.count({ where: { endedAt: null } }),
    prisma.visit.count({ where: { startedAt: { gte: todayStart } } }),
    prisma.invoice.aggregate({ _sum: { total: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.labTest.count({ where: { status: { in: ["ORDERED", "RECEIVED"] } } }),
    prisma.labTest.count({ where: { status: "COMPLETE", analyzedAt: { gte: subHours(now, 24) } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: thisMonthStart } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: previousMonthStart, lt: thisMonthStart } }
    }),
    prisma.visit.count({ where: { startedAt: { gte: lastSevenStart } } }),
    prisma.visit.count({ where: { startedAt: { gte: previousSevenStart, lt: lastSevenStart } } })
  ]);

  const outstanding = Math.max(
    Number(invoicesAggregate._sum.total ?? 0) - Number(paymentsAggregate._sum.amount ?? 0),
    0
  );
  const revenueThisMonth = Number(paymentsThisMonthAggregate._sum.amount ?? 0);
  const revenuePreviousMonth = Number(paymentsPreviousMonthAggregate._sum.amount ?? 0);

  const visitTrendRaw = await prisma.visit.findMany({
    where: { startedAt: { gte: lastSevenStart } },
    select: { startedAt: true },
    orderBy: { startedAt: "asc" }
  });

  const visitCounts = new Map<string, number>();
  for (const visit of visitTrendRaw) {
    const key = format(visit.startedAt, "yyyy-MM-dd");
    visitCounts.set(key, (visitCounts.get(key) ?? 0) + 1);
  }

  const trend = eachDayOfInterval({ start: lastSevenStart, end: todayStart }).map(day => {
    const key = format(day, "yyyy-MM-dd");
    return {
      date: day.toISOString(),
      label: format(day, "EEE"),
      count: visitCounts.get(key) ?? 0
    };
  });

  return {
    totals: {
      patients: totalPatients,
      visitsAllTime,
      activeVisits,
      visitsToday
    },
    revenue: {
      thisMonth: revenueThisMonth,
      previousMonth: revenuePreviousMonth,
      change: revenueThisMonth - revenuePreviousMonth,
      outstanding
    },
    labs: {
      pending: pendingLabs,
      completed24h: labsCompleted24h
    },
    visits: {
      lastSevenDays: visitsLastSeven,
      previousSevenDays: visitsPreviousSeven,
      change: visitsLastSeven - visitsPreviousSeven,
      trend
    }
  };
}
