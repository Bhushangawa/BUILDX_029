import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      reporterName = "Anonymous Citizen",
      reporterPhone,
      locationName,
      latitude,
      longitude,
      description,
      photoUrl,
    } = body;

    if (!locationName || !description) {
      return NextResponse.json(
        { error: "Location and description are required for sighting submission." },
        { status: 400 }
      );
    }

    const missingCase = await prisma.missingPerson.findUnique({
      where: { id: params.id },
    });
    if (!missingCase) {
      return NextResponse.json({ error: "Missing person case not found." }, { status: 404 });
    }

    const sighting = await prisma.sighting.create({
      data: {
        missingPersonId: params.id,
        reporterName,
        reporterPhone,
        locationName,
        latitude: latitude || 19.076,
        longitude: longitude || 72.8777,
        description,
        photoUrl,
        verificationStatus: "PENDING",
      },
    });

    // Update missing person status to SIGHTING_LOGGED
    await prisma.missingPerson.update({
      where: { id: params.id },
      data: { status: "SIGHTING_LOGGED" },
    });

    // Add Timeline event
    await prisma.caseTimelineEvent.create({
      data: {
        missingPersonId: params.id,
        eventType: "SIGHTING_REPORTED",
        description: `Potential sighting reported near "${locationName}" by ${reporterName}: "${description}". Awaiting Admin verification.`,
        actorName: reporterName,
        actorRole: "VOLUNTEER",
      },
    });

    // Alert
    await prisma.alertNotification.create({
      data: {
        title: `SIGHTING REPORTED: ${missingCase.fullName}`,
        message: `Reported at ${locationName}. Verification required before dispatching search party.`,
        type: "MISSING_PERSON",
        priority: "HIGH",
        targetRole: "ADMIN",
        linkUrl: `/missing-persons?case=${params.id}`,
      },
    });

    return NextResponse.json({ success: true, sighting });
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
    const { sightingId, verificationStatus, verifiedBy = "Admin Verifier" } = body;

    if (!sightingId || !["VERIFIED", "FALSE_ALARM"].includes(verificationStatus)) {
      return NextResponse.json(
        { error: "Invalid sightingId or status. Must be VERIFIED or FALSE_ALARM." },
        { status: 400 }
      );
    }

    const updatedSighting = await prisma.sighting.update({
      where: { id: sightingId },
      data: {
        verificationStatus,
        verifiedBy,
      },
    });

    const isVerified = verificationStatus === "VERIFIED";

    await prisma.caseTimelineEvent.create({
      data: {
        missingPersonId: params.id,
        eventType: isVerified ? "SIGHTING_VERIFIED" : "SIGHTING_FALSE_ALARM",
        description: isVerified
          ? `Sighting near ${updatedSighting.locationName} VERIFIED by ${verifiedBy}. Ground team converging.`
          : `Sighting flagged as FALSE ALARM by ${verifiedBy}. Search perimeter maintained.`,
        actorName: verifiedBy,
        actorRole: "ADMIN",
      },
    });

    return NextResponse.json({ success: true, sighting: updatedSighting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}