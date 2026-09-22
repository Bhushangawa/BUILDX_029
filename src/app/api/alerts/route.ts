import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const role = req.cookies.get("sentinel_role")?.value || "ALL";

    const alerts = await prisma.alertNotification.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: role }],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    return NextResponse.json({ alerts, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, markAllRead } = body;

    if (markAllRead) {
      await prisma.alertNotification.updateMany({
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All alerts marked read." });
    }

    if (alertId) {
      const updated = await prisma.alertNotification.update({
        where: { id: alertId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, alert: updated });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}