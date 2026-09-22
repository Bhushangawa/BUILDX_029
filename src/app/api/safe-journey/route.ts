import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const journey = await prisma.safeJourney.findFirst({
      where: {
        status: { in: ["ACTIVE", "DEVIATION_DETECTED", "PANIC_TRIGGERED"] },
      },
      orderBy: { startedAt: "desc" },
    });

    const contacts = await prisma.trustedContact.findMany();

    return NextResponse.json({ journey, contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, journeyId, destinationLocation, transportMode, deviationReason } = body;

    if (action === "START") {
      const newJourney = await prisma.safeJourney.create({
        data: {
          userName: "Priya Sharma",
          startLocation: "Metropolitan Arena Gate 2",
          destinationLocation: destinationLocation || "Grand Metro Interchange Station",
          startLat: 19.0762,
          startLng: 72.8772,
          destLat: 19.0910,
          destLng: 72.8620,
          lastKnownLat: 19.0775,
          lastKnownLng: 72.8755,
          transportMode: transportMode || "AUTO",
          status: "ACTIVE",
          isSafe: true,
          trustedContactName: "Rahul Sharma (Brother)",
          trustedContactPhone: "+91 98765 00000",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "SAFE_JOURNEY_STARTED",
          actorName: "Priya Sharma",
          actorRole: "CITIZEN",
          targetEntity: "SafeJourney",
          targetId: newJourney.id,
          details: `Commenced journey to ${newJourney.destinationLocation} via ${newJourney.transportMode}`,
        },
      });

      return NextResponse.json({ success: true, journey: newJourney });
    }

    if (action === "SIMULATE_DEVIATION") {
      const targetId = journeyId || (await prisma.safeJourney.findFirst({ where: { status: "ACTIVE" } }))?.id;
      if (!targetId) {
        return NextResponse.json({ error: "No active journey to simulate deviation." }, { status: 400 });
      }

      // Move coords off-route
      const updated = await prisma.safeJourney.update({
        where: { id: targetId },
        data: {
          status: "DEVIATION_DETECTED",
          deviationTriggered: true,
          deviationReason: deviationReason || "Auto diverted from Eastern Express corridor into isolated unlit lane.",
          lastKnownLat: 19.0880,
          lastKnownLng: 72.8690, // Off expected path
        },
      });

      await prisma.alertNotification.create({
        data: {
          title: "SAFE JOURNEY: Route Deviation Detected",
          message: `Priya Sharma's vehicle diverted from registered path near Eastern Link. Safety prompt issued.`,
          type: "SAFE_JOURNEY",
          priority: "HIGH",
          targetRole: "ALL",
          linkUrl: "/safe-journey",
        },
      });

      return NextResponse.json({ success: true, journey: updated });
    }

    if (action === "CONFIRM_SAFE") {
      const updated = await prisma.safeJourney.update({
        where: { id: journeyId },
        data: {
          status: "ACTIVE",
          deviationTriggered: false,
          isSafe: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "SAFE_JOURNEY_CHECKIN_SAFE",
          actorName: "Priya Sharma",
          actorRole: "CITIZEN",
          targetEntity: "SafeJourney",
          targetId: journeyId,
          details: "User confirmed 'I Am Safe' following route deviation alert.",
        },
      });

      return NextResponse.json({ success: true, journey: updated });
    }

    if (action === "TRIGGER_PANIC") {
      // 1. Mark journey as panic
      const updated = await prisma.safeJourney.update({
        where: { id: journeyId },
        data: {
          status: "PANIC_TRIGGERED",
          isSafe: false,
        },
      });

      // 2. Automatically generate CRITICAL incident on the central command center map
      const count = await prisma.incident.count();
      const incidentNumber = `INC-2026-${String(count + 1).padStart(3, "0")}`;

      const panicIncident = await prisma.incident.create({
        data: {
          incidentNumber,
          title: `EMERGENCY PANIC: Safe Journey Deviation (${updated.userName})`,
          description: `User triggered emergency panic alert during commute in ${updated.transportMode}. Vehicle diverted off-route into isolated area. Live telemetry: Lat ${updated.lastKnownLat}, Lng ${updated.lastKnownLng}. Trusted contacts notified.`,
          category: "PERSONAL_SAFETY",
          priority: "CRITICAL",
          status: "ASSIGNED",
          escalationLevel: "ESCALATED",
          latitude: updated.lastKnownLat,
          longitude: updated.lastKnownLng,
          locationName: `Off-Route Deviation Point (Near Eastern Link)`,
          reporterName: updated.userName,
          reporterPhone: updated.trustedContactPhone,
          aiCategorySuggestion: "PERSONAL_SAFETY",
          aiPrioritySuggestion: "CRITICAL",
          aiTeamSuggestion: "SECURITY",
          aiSummary: "CRITICAL IN-TRANSIT PANIC: Commuter route deviation confirmed unsafe. Immediate intercept patrol required.",
        },
      });

      // Find nearest security patrol and auto-assign
      const teams = await prisma.responseTeam.findMany();
      const patrol = teams.find((t) => t.type === "SECURITY" && t.status === "AVAILABLE") || teams[0];
      if (patrol) {
        await prisma.incident.update({
          where: { id: panicIncident.id },
          data: { assignedTeamId: patrol.id },
        });
        await prisma.responseTeam.update({
          where: { id: patrol.id },
          data: { status: "DISPATCHED" },
        });
      }

      // Add timeline
      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: panicIncident.id,
          eventType: "PANIC_ALARM",
          description: `User hit 'NEED HELP' after route deviation. Intercept dispatch triggered to ${patrol?.name || "Unit"}.`,
          actorName: updated.userName,
          actorRole: "CITIZEN",
        },
      });

      // Alert
      await prisma.alertNotification.create({
        data: {
          title: `CRITICAL SOS: In-Transit Commuter (${updated.userName})`,
          message: `Panic button activated at ${updated.lastKnownLat}, ${updated.lastKnownLng}. Intercept unit dispatched!`,
          type: "SAFE_JOURNEY",
          priority: "CRITICAL",
          targetRole: "ALL",
          linkUrl: `/command-center?incident=${panicIncident.id}`,
        },
      });

      return NextResponse.json({
        success: true,
        journey: updated,
        panicIncident,
        dispatchedTeam: patrol,
      });
    }

    if (action === "COMPLETE") {
      const updated = await prisma.safeJourney.update({
        where: { id: journeyId },
        data: {
          status: "COMPLETED",
          isSafe: true,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, journey: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}