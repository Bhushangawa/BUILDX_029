import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        assignedTeam: true,
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
        reports: true,
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      status,
      priority,
      assignedTeamId,
      actorName = "Admin Operator",
      actorRole = "ADMIN",
      note,
    } = body;

    const existing = await prisma.incident.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (priority) dataToUpdate.priority = priority;
    if (assignedTeamId !== undefined) dataToUpdate.assignedTeamId = assignedTeamId;

    if (status === "VERIFIED" && !existing.verifiedByAdmin) {
      dataToUpdate.verifiedByAdmin = true;
      dataToUpdate.verifiedAt = new Date();
    }
    if (status === "ACKNOWLEDGED" && !existing.acknowledgedAt) {
      dataToUpdate.acknowledgedAt = new Date();
      dataToUpdate.escalationLevel = "NORMAL";
    }
    if (status === "RESOLVED" && !existing.resolvedAt) {
      dataToUpdate.resolvedAt = new Date();
      dataToUpdate.escalationLevel = "NORMAL";
    }

    const updated = await prisma.incident.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        assignedTeam: true,
      },
    });

    // Record Timeline Event
    let timelineDesc = note;
    if (!timelineDesc) {
      if (status && status !== existing.status) {
        timelineDesc = `Status transitioned to ${status} by ${actorName} (${actorRole}).`;
      } else if (assignedTeamId && assignedTeamId !== existing.assignedTeamId) {
        timelineDesc = `Response team reassigned to ${updated.assignedTeam?.name || "Unit"} by ${actorName}.`;
      } else if (priority && priority !== existing.priority) {
        timelineDesc = `Priority updated to ${priority} by ${actorName}.`;
      } else {
        timelineDesc = `Incident details updated by ${actorName}.`;
      }
    }

    await prisma.caseTimelineEvent.create({
      data: {
        incidentId: params.id,
        eventType: status || "UPDATE",
        description: timelineDesc,
        actorName,
        actorRole,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: `INCIDENT_${status || "UPDATED"}`,
        actorName,
        actorRole,
        targetEntity: "Incident",
        targetId: params.id,
        details: timelineDesc,
      },
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}