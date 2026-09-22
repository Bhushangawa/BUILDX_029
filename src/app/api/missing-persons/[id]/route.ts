import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleCookie = req.cookies.get("sentinel_role")?.value || "CITIZEN";
    const person = await prisma.missingPerson.findUnique({
      where: { id: params.id },
      include: {
        assignedTeam: true,
        sightings: {
          orderBy: { createdAt: "desc" },
        },
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!person) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const isAuthorized = ["ADMIN", "SECURITY_STAFF", "VOLUNTEER"].includes(roleCookie);
    const safeData =
      person.type === "CHILD" && !isAuthorized
        ? {
            ...person,
            contactPhone: "Protected (Contact Help Desk / Police)",
            identifyingFeatures: "Protected: Authorized personnel only",
            isMaskedForPrivacy: true,
          }
        : { ...person, isMaskedForPrivacy: false };

    return NextResponse.json({ case: safeData, isAuthorizedViewer: isAuthorized });
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
      assignedTeamId,
      searchRadiusMeters,
      actorName = "Admin Command",
      actorRole = "ADMIN",
      note,
    } = body;

    const existing = await prisma.missingPerson.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (assignedTeamId !== undefined) dataToUpdate.assignedTeamId = assignedTeamId;
    if (searchRadiusMeters) dataToUpdate.searchRadiusMeters = Number(searchRadiusMeters);

    const updated = await prisma.missingPerson.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: { assignedTeam: true },
    });

    // Timeline event
    let timelineDesc = note;
    if (!timelineDesc) {
      if (status && status !== existing.status) {
        timelineDesc =
          status === "FOUND_SAFE"
            ? `Individual safely located and reunited with family! Case resolved.`
            : `Case status updated to ${status} by ${actorName}.`;
      } else if (assignedTeamId && assignedTeamId !== existing.assignedTeamId) {
        timelineDesc = `Search team reassigned to ${updated.assignedTeam?.name || "Unit"} by ${actorName}.`;
      } else {
        timelineDesc = `Case details updated by ${actorName}.`;
      }
    }

    await prisma.caseTimelineEvent.create({
      data: {
        missingPersonId: params.id,
        eventType: status || "UPDATE",
        description: timelineDesc,
        actorName,
        actorRole,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: `MISSING_PERSON_${status || "UPDATED"}`,
        actorName,
        actorRole,
        targetEntity: "MissingPerson",
        targetId: params.id,
        details: timelineDesc,
      },
    });

    return NextResponse.json({ success: true, case: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}