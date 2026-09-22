import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findNearestSuitableTeam } from "@/lib/geo-utils";

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get("sentinel_role")?.value || "CITIZEN";
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CHILD, ELDERLY, ADULT
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const cases = await prisma.missingPerson.findMany({
      where: whereClause,
      include: {
        assignedTeam: true,
        sightings: {
          orderBy: { createdAt: "desc" },
        },
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enforce privacy for sensitive children if viewer is public citizen
    const isAuthorized = ["ADMIN", "SECURITY_STAFF", "VOLUNTEER"].includes(roleCookie);

    const safeCases = cases.map((c) => {
      if (c.type === "CHILD" && !isAuthorized) {
        return {
          ...c,
          contactPhone: "Protected (Contact Help Desk / Police)",
          identifyingFeatures: "Protected: Authorized personnel only",
          isMaskedForPrivacy: true,
        };
      }
      return { ...c, isMaskedForPrivacy: false };
    });

    return NextResponse.json({ cases: safeCases, isAuthorizedViewer: isAuthorized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "CHILD",
      fullName,
      age,
      gender,
      photoUrl,
      lastSeenLocation,
      latitude,
      longitude,
      lastSeenTime,
      clothingDescription,
      identifyingFeatures,
      medicalConditions,
      contactPersonName,
      contactPhone,
      contactRelation,
      searchRadiusMeters,
    } = body;

    if (!fullName || !lastSeenLocation || !clothingDescription) {
      return NextResponse.json(
        { error: "Full name, last seen location, and clothing description are required." },
        { status: 400 }
      );
    }

    const lat = latitude || 19.0768;
    const lng = longitude || 72.8785;

    // Calculate dynamic search radius based on elapsed time (approx 1.5 km/hr walking)
    const elapsedMinutes = lastSeenTime
      ? Math.max(10, Math.round((Date.now() - new Date(lastSeenTime).getTime()) / (1000 * 60)))
      : 25;
    
    // Child: ~30m per minute radius growth, base 400m; Elderly: ~20m per minute, base 500m
    const calculatedRadius =
      searchRadiusMeters ||
      Math.min(
        type === "CHILD" ? 400 + elapsedMinutes * 25 : 500 + elapsedMinutes * 20,
        2500
      );

    // Auto-match nearest Search & Rescue team
    const teams = await prisma.responseTeam.findMany();
    const teamRecommendation = findNearestSuitableTeam(teams, lat, lng, "SEARCH_RESCUE");

    const count = await prisma.missingPerson.count();
    const caseNumber = `MP-2026-${String(count + 1).padStart(3, "0")}`;

    const newCase = await prisma.missingPerson.create({
      data: {
        caseNumber,
        type,
        fullName,
        age: Number(age) || 6,
        gender: gender || "Unknown",
        photoUrl: photoUrl || (type === "CHILD" ? "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=300" : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"),
        lastSeenLocation,
        latitude: lat,
        longitude: lng,
        lastSeenTime: lastSeenTime ? new Date(lastSeenTime) : new Date(),
        clothingDescription,
        identifyingFeatures,
        medicalConditions,
        contactPersonName: contactPersonName || "Parent / Guardian",
        contactPhone: contactPhone || "+91 98765 00000",
        contactRelation: contactRelation || "Guardian",
        searchRadiusMeters: Math.round(calculatedRadius),
        status: "REPORTED",
        isSensitive: type === "CHILD",
        assignedTeamId: teamRecommendation?.team.id || null,
      },
      include: {
        assignedTeam: true,
      },
    });

    // Timeline events
    await prisma.caseTimelineEvent.createMany({
      data: [
        {
          missingPersonId: newCase.id,
          eventType: "CREATED",
          description: `Missing ${type.toLowerCase()} report filed for ${fullName} (${age}yo).`,
          actorName: contactPersonName || "Family",
          actorRole: "CITIZEN",
        },
        {
          missingPersonId: newCase.id,
          eventType: "RADIUS_ESTIMATED",
          description: `Search perimeter estimated at ${Math.round(calculatedRadius)}m radius around ${lastSeenLocation}.`,
          actorName: "Search Grid Coordinator",
          actorRole: "SYSTEM",
        },
      ],
    });

    // In-app alert
    await prisma.alertNotification.create({
      data: {
        title: `MISSING ${type}: ${fullName} (${age}yo)`,
        message: `Last seen at ${lastSeenLocation}. Perimeter: ${Math.round(calculatedRadius)}m. Authorized teams & volunteers alerted.`,
        type: "MISSING_PERSON",
        priority: "CRITICAL",
        targetRole: "ALL",
        linkUrl: `/missing-persons?case=${newCase.id}`,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "MISSING_PERSON_REPORTED",
        actorName: contactPersonName || "Citizen",
        actorRole: "CITIZEN",
        targetEntity: "MissingPerson",
        targetId: newCase.id,
        details: `Reported missing ${type.toLowerCase()} #${caseNumber} (${fullName})`,
      },
    });

    return NextResponse.json({
      success: true,
      case: newCase,
      calculatedRadius,
      teamRecommendation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}