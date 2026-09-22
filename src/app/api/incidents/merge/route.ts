import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action, // "MERGE" | "KEEP_SEPARATE"
      masterIncidentId,
      duplicateIncidentId,
      actorName = "Admin Control Room",
    } = body;

    if (!masterIncidentId || !duplicateIncidentId) {
      return NextResponse.json(
        { error: "Both masterIncidentId and duplicateIncidentId are required." },
        { status: 400 }
      );
    }

    const master = await prisma.incident.findUnique({
      where: { id: masterIncidentId },
    });
    const dup = await prisma.incident.findUnique({
      where: { id: duplicateIncidentId },
    });

    if (!master || !dup) {
      return NextResponse.json(
        { error: "One or both incidents could not be found." },
        { status: 404 }
      );
    }

    if (action === "MERGE") {
      // 1. Create an IncidentReport attached to the master incident
      await prisma.incidentReport.create({
        data: {
          masterIncidentId: master.id,
          rawDescription: dup.description,
          locationName: dup.locationName,
          latitude: dup.latitude,
          longitude: dup.longitude,
          reporterContact: dup.reporterName ? `${dup.reporterName} (${dup.reporterPhone || "No Phone"})` : "Anonymous",
          mediaUrl: dup.mediaUrl,
          similarityScore: dup.duplicateScore || 0.9,
        },
      });

      // 2. Mark the duplicate incident as RESOLVED with note
      await prisma.incident.update({
        where: { id: dup.id },
        data: {
          status: "RESOLVED",
          masterIncidentId: master.id,
          resolvedAt: new Date(),
        },
      });

      // 3. Add timeline events to both
      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: master.id,
          eventType: "MERGED_REPORT_ADDED",
          description: `Correlated report #${dup.incidentNumber} merged into this Master incident by ${actorName}. Witness and location intelligence unified.`,
          actorName,
          actorRole: "ADMIN",
        },
      });

      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: dup.id,
          eventType: "RESOLVED_MERGED",
          description: `Case merged into Master #${master.incidentNumber} to eliminate operational redundancy.`,
          actorName,
          actorRole: "ADMIN",
        },
      });

      // 4. Audit log
      await prisma.auditLog.create({
        data: {
          action: "INCIDENTS_MERGED",
          actorName,
          actorRole: "ADMIN",
          targetEntity: "Incident",
          targetId: master.id,
          details: `Merged duplicate incident #${dup.incidentNumber} into Master #${master.incidentNumber}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully merged #${dup.incidentNumber} into Master #${master.incidentNumber}`,
      });
    } else {
      // KEEP_SEPARATE
      await prisma.incident.update({
        where: { id: dup.id },
        data: {
          masterIncidentId: null,
          duplicateScore: null,
        },
      });

      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: dup.id,
          eventType: "CONFIRMED_SEPARATE",
          description: `Admin verified incident is an independent event; duplicate correlation unlinked.`,
          actorName,
          actorRole: "ADMIN",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Incident #${dup.incidentNumber} confirmed as independent event.`,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}