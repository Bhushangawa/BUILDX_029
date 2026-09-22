import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeIncidentIntelligence, detectDuplicateIncident } from "@/lib/ai-engine";
import { findNearestSuitableTeam } from "@/lib/geo-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const escalation = searchParams.get("escalation");

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (escalation) whereClause.escalationLevel = escalation;

    const incidents = await prisma.incident.findMany({
      where: whereClause,
      include: {
        assignedTeam: true,
        timelineEvents: {
          orderBy: { createdAt: "desc" },
        },
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ incidents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      category: explicitCategory,
      priority: explicitPriority,
      latitude,
      longitude,
      locationName,
      reporterName,
      reporterPhone,
      isAnonymous = false,
      mediaUrl,
    } = body;

    if (!description || !locationName) {
      return NextResponse.json(
        { error: "Description and location are required." },
        { status: 400 }
      );
    }

    const lat = latitude || 19.076;
    const lng = longitude || 72.8777;

    // 1. Run AI Incident Intelligence
    const aiTriage = await analyzeIncidentIntelligence(description, locationName, mediaUrl);

    const category = explicitCategory || aiTriage.category;
    const priority = explicitPriority || aiTriage.priority;

    // 2. Run AI Duplicate Incident Detection
    const activeIncidents = await prisma.incident.findMany({
      where: {
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    });

    const duplicateCheck = detectDuplicateIncident(
      {
        description,
        latitude: lat,
        longitude: lng,
        category,
        createdAt: new Date(),
      },
      activeIncidents as any
    );

    // 3. Auto-suggest nearest response team
    const teams = await prisma.responseTeam.findMany();
    const teamRecommendation = findNearestSuitableTeam(
      teams,
      lat,
      lng,
      aiTriage.suggestedTeamType
    );

    // 4. Generate unique Incident Number
    const count = await prisma.incident.count();
    const incidentNumber = `INC-2026-${String(count + 1).padStart(3, "0")}`;

    const incidentTitle =
      title || `${category.replace(/_/g, " ")} at ${locationName}`;

    // 5. Create Incident in Database
    const newIncident = await prisma.incident.create({
      data: {
        incidentNumber,
        title: incidentTitle,
        description,
        category,
        priority,
        status: "REPORTED",
        escalationLevel: "NORMAL",
        latitude: lat,
        longitude: lng,
        locationName,
        reporterName: isAnonymous ? "Anonymous Citizen" : reporterName || "Concerned Citizen",
        reporterPhone: isAnonymous ? null : reporterPhone,
        isAnonymous,
        mediaUrl,
        aiCategorySuggestion: aiTriage.category,
        aiPrioritySuggestion: aiTriage.priority,
        aiTeamSuggestion: aiTriage.suggestedTeamType,
        aiSummary: aiTriage.summary,
        duplicateScore: duplicateCheck.isDuplicate ? duplicateCheck.confidence / 100 : null,
        masterIncidentId: duplicateCheck.isDuplicate ? duplicateCheck.masterIncidentId : null,
        assignedTeamId: teamRecommendation?.team.id || null,
      },
      include: {
        assignedTeam: true,
      },
    });

    // 6. Create Timeline Events
    await prisma.caseTimelineEvent.createMany({
      data: [
        {
          incidentId: newIncident.id,
          eventType: "CREATED",
          description: `Incident report filed by ${
            isAnonymous ? "Anonymous Witness" : reporterName || "Citizen"
          }.`,
          actorName: isAnonymous ? "Anonymous" : reporterName || "Citizen",
          actorRole: "CITIZEN",
        },
        {
          incidentId: newIncident.id,
          eventType: "AI_TRIAGED",
          description: aiTriage.summary,
          actorName: "AI Incident Intelligence",
          actorRole: "SYSTEM",
        },
      ],
    });

    // 7. If duplicate detected, log event
    if (duplicateCheck.isDuplicate && duplicateCheck.masterIncidentNumber) {
      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: newIncident.id,
          eventType: "DUPLICATE_FLAGGED",
          description: `AI flagged possible duplicate of Master #${duplicateCheck.masterIncidentNumber} (${duplicateCheck.confidence}% confidence). Review recommended.`,
          actorName: "AI Cluster Engine",
          actorRole: "SYSTEM",
        },
      });
    }

    // 8. Generate In-App Alert Notification
    if (priority === "CRITICAL" || priority === "HIGH") {
      await prisma.alertNotification.create({
        data: {
          title: `ALERT [${priority}]: ${incidentTitle}`,
          message: `${aiTriage.summary} at ${locationName}`,
          type: "INCIDENT",
          priority,
          targetRole: "ALL",
          linkUrl: `/command-center?incident=${newIncident.id}`,
        },
      });
    }

    // 9. Add Audit Log
    await prisma.auditLog.create({
      data: {
        action: "INCIDENT_CREATED",
        actorName: isAnonymous ? "Anonymous" : reporterName || "Citizen",
        actorRole: "CITIZEN",
        targetEntity: "Incident",
        targetId: newIncident.id,
        details: `Created incident #${incidentNumber} with AI Priority: ${priority}`,
      },
    });

    return NextResponse.json({
      success: true,
      incident: newIncident,
      aiTriage,
      duplicateCheck,
      teamRecommendation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}