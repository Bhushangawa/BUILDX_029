import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      activeIncidentsCount,
      criticalAlertsCount,
      missingPersonsCount,
      crowdAlertsCount,
      activeTeamsCount,
      resolvedCasesCount,
      allIncidents,
      allZones,
      allMissing,
      allTeams,
    ] = await Promise.all([
      prisma.incident.count({
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.incident.count({
        where: { priority: "CRITICAL", status: { notIn: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.missingPerson.count({
        where: { status: { notIn: ["FOUND_SAFE", "CLOSED"] } },
      }),
      prisma.crowdZone.count({
        where: { alertActive: true },
      }),
      prisma.responseTeam.count({
        where: { status: { in: ["AVAILABLE", "DISPATCHED", "ON_SCENE"] } },
      }),
      prisma.incident.count({
        where: { status: { in: ["RESOLVED", "CLOSED"] } },
      }),
      prisma.incident.findMany({
        select: {
          id: true,
          category: true,
          priority: true,
          status: true,
          escalationLevel: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          acknowledgedAt: true,
          resolvedAt: true,
        },
      }),
      prisma.crowdZone.findMany(),
      prisma.missingPerson.findMany({
        select: {
          id: true,
          type: true,
          status: true,
          latitude: true,
          longitude: true,
        },
      }),
      prisma.responseTeam.findMany({
        include: {
          incidents: true,
        },
      }),
    ]);

    // Calculate Average Response Time (minutes from created to acknowledged or resolved)
    let totalResponseMinutes = 0;
    let acknowledgedSamples = 0;

    for (const inc of allIncidents) {
      const targetTime = inc.acknowledgedAt || inc.resolvedAt;
      if (targetTime) {
        const diff = (new Date(targetTime).getTime() - new Date(inc.createdAt).getTime()) / (1000 * 60);
        if (diff > 0 && diff < 120) {
          totalResponseMinutes += diff;
          acknowledgedSamples++;
        }
      }
    }
    const avgResponseTimeMinutes =
      acknowledgedSamples > 0 ? Number((totalResponseMinutes / acknowledgedSamples).toFixed(1)) : 4.5;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const inc of allIncidents) {
      categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat.replace(/_/g, " "),
      count,
    }));

    // Priority breakdown
    const priorityCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    for (const inc of allIncidents) {
      if (priorityCounts[inc.priority] !== undefined) {
        priorityCounts[inc.priority]++;
      }
    }

    // Hourly distribution (synthetic histogram over last 8 hours for visualization)
    const hourlyData = [
      { hour: "04:00", incidents: 1, crowdLevel: 15 },
      { hour: "06:00", incidents: 2, crowdLevel: 25 },
      { hour: "08:00", incidents: 5, crowdLevel: 55 },
      { hour: "10:00", incidents: 8, crowdLevel: 75 },
      { hour: "12:00", incidents: 14, crowdLevel: 85 },
      { hour: "14:00", incidents: 12, crowdLevel: 78 },
      { hour: "16:00", incidents: 18, crowdLevel: 89 },
      { hour: "Now", incidents: allIncidents.length, crowdLevel: 82 },
    ];

    // Crowd zones load
    const zoneLoads = allZones.map((z) => ({
      name: z.name,
      density: Math.round(z.densityRatio * 100),
      capacity: z.capacity,
      current: z.currentCount,
      riskLevel: z.riskLevel,
      alertActive: z.alertActive,
    }));

    // Team workloads
    const teamWorkloads = allTeams.map((t) => ({
      name: t.name,
      type: t.type,
      status: t.status,
      assignedIncidentsCount: t.incidents.length,
      members: t.memberCount,
    }));

    // Heatmap points (coordinates + weight)
    const heatmapPoints = [
      ...allIncidents.map((i) => ({
        lat: i.latitude,
        lng: i.longitude,
        weight: i.priority === "CRITICAL" ? 1.0 : i.priority === "HIGH" ? 0.7 : 0.4,
      })),
      ...allZones.map((z) => ({
        lat: z.latitude,
        lng: z.longitude,
        weight: z.densityRatio,
      })),
      ...allMissing.map((m) => ({
        lat: m.latitude,
        lng: m.longitude,
        weight: 0.8,
      })),
    ];

    return NextResponse.json({
      kpis: {
        activeIncidents: activeIncidentsCount,
        criticalAlerts: criticalAlertsCount,
        missingPersons: missingPersonsCount,
        crowdAlerts: crowdAlertsCount,
        activeTeams: activeTeamsCount,
        resolvedCases: resolvedCasesCount,
        avgResponseTimeMinutes,
      },
      categoryBreakdown,
      priorityCounts,
      hourlyData,
      zoneLoads,
      teamWorkloads,
      heatmapPoints,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}