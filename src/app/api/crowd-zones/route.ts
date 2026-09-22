import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findNearestSuitableTeam } from "@/lib/geo-utils";

export async function GET() {
  try {
    const zones = await prisma.crowdZone.findMany({
      include: { assignedTeam: true },
      orderBy: { densityRatio: "desc" },
    });

    return NextResponse.json({ zones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, newCount, surgeSimulation = false, assignedTeamId } = body;

    const zone = await prisma.crowdZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    const count = surgeSimulation
      ? Math.round(zone.capacity * 0.91)
      : typeof newCount === "number"
      ? newCount
      : zone.currentCount;

    const densityRatio = Math.min(Number((count / zone.capacity).toFixed(2)), 1.0);

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let alertActive = false;
    let alertMessage: string | null = null;

    if (densityRatio >= 0.85) {
      riskLevel = "CRITICAL";
      alertActive = true;
      alertMessage = `CRITICAL CROWD SURGE: ${Math.round(densityRatio * 100)}% capacity exceeded at ${zone.name}. Immediate bottleneck hazard!`;
    } else if (densityRatio >= 0.7) {
      riskLevel = "HIGH";
      alertActive = true;
      alertMessage = `HIGH DENSITY: ${Math.round(densityRatio * 100)}% capacity reached at ${zone.name}.`;
    } else if (densityRatio >= 0.4) {
      riskLevel = "MEDIUM";
    }

    // Check for team assignment
    let finalTeamId = assignedTeamId !== undefined ? assignedTeamId : zone.assignedTeamId;
    if (!finalTeamId && alertActive) {
      const teams = await prisma.responseTeam.findMany();
      const nearest = findNearestSuitableTeam(teams, zone.latitude, zone.longitude, "CROWD_CONTROL");
      if (nearest) finalTeamId = nearest.team.id;
    }

    const updatedZone = await prisma.crowdZone.update({
      where: { id: zoneId },
      data: {
        currentCount: count,
        densityRatio,
        riskLevel,
        alertActive,
        alertMessage,
        assignedTeamId: finalTeamId,
        lastUpdated: new Date(),
      },
      include: { assignedTeam: true },
    });

    if (alertActive) {
      await prisma.alertNotification.create({
        data: {
          title: `CROWD SURGE: ${zone.name}`,
          message: alertMessage!,
          type: "CROWD",
          priority: riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH",
          targetRole: "ALL",
          linkUrl: `/crowd-monitoring?zone=${zone.id}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "CROWD_THRESHOLD_EXCEEDED",
          actorName: "Crowd Density Sensor Grid",
          actorRole: "SYSTEM",
          targetEntity: "CrowdZone",
          targetId: zone.id,
          details: alertMessage!,
        },
      });
    }

    return NextResponse.json({ success: true, zone: updatedZone });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}