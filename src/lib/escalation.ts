import { prisma } from "./db";

/**
 * Checks all active unacknowledged incidents and upgrades escalation level
 * based on SLA thresholds:
 * - CRITICAL: Warning after 2 mins, Escalated after 4 mins
 * - HIGH: Warning after 4 mins, Escalated after 8 mins
 * - MEDIUM/LOW: Warning after 8 mins, Escalated after 15 mins
 */
export async function checkAndEscalateIncidents() {
  const now = new Date().getTime();
  const openIncidents = await prisma.incident.findMany({
    where: {
      status: { in: ["REPORTED", "VERIFIED", "ASSIGNED"] },
      escalationLevel: { not: "ESCALATED" },
    },
  });

  const escalatedList = [];

  for (const inc of openIncidents) {
    const ageMinutes = (now - new Date(inc.createdAt).getTime()) / (1000 * 60);

    let newLevel: "NORMAL" | "WARNING" | "ESCALATED" = inc.escalationLevel as any;

    if (inc.priority === "CRITICAL") {
      if (ageMinutes >= 4) newLevel = "ESCALATED";
      else if (ageMinutes >= 2) newLevel = "WARNING";
    } else if (inc.priority === "HIGH") {
      if (ageMinutes >= 8) newLevel = "ESCALATED";
      else if (ageMinutes >= 4) newLevel = "WARNING";
    } else {
      if (ageMinutes >= 15) newLevel = "ESCALATED";
      else if (ageMinutes >= 8) newLevel = "WARNING";
    }

    if (newLevel !== inc.escalationLevel) {
      const updated = await prisma.incident.update({
        where: { id: inc.id },
        data: { escalationLevel: newLevel },
      });

      await prisma.caseTimelineEvent.create({
        data: {
          incidentId: inc.id,
          eventType: "ESCALATION_UPGRADE",
          description: `Incident SLA exceeded response threshold. Escalated to ${newLevel}.`,
          actorName: "SLA Escalation Watchdog",
          actorRole: "SYSTEM",
        },
      });

      escalatedList.push(updated);
    }
  }

  return escalatedList;
}
