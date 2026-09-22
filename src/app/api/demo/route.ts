import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step } = body;

    switch (step) {
      case "RESET": {
        // Run seed script
        await execAsync("node prisma/seed.js");
        return NextResponse.json({
          success: true,
          step: "RESET",
          message: "Festival environment reset to baseline demo state.",
        });
      }

      case "STEP_1_CHILD_MISSING": {
        // Create child missing case
        const count = await prisma.missingPerson.count();
        const caseNumber = `MP-2026-${String(count + 1).padStart(3, "0")}`;
        const newChild = await prisma.missingPerson.create({
          data: {
            caseNumber,
            type: "CHILD",
            fullName: "Aarav Patel",
            age: 6,
            gender: "Male",
            photoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=300",
            lastSeenLocation: "North Arena Lawn near Food Court",
            latitude: 19.0768,
            longitude: 72.8785,
            lastSeenTime: new Date(Date.now() - 15 * 60 * 1000),
            clothingDescription: "Red t-shirt with cartoon print, blue denim shorts, white velcro sneakers",
            identifyingFeatures: "Birthmark on right cheek, carries a blue water bottle",
            medicalConditions: "None. Responds to nickname 'Aaru'.",
            contactPersonName: "Sunita Patel (Mother)",
            contactPhone: "+91 98201 55443",
            contactRelation: "Mother",
            searchRadiusMeters: 850,
            status: "REPORTED",
            isSensitive: true,
          },
        });

        await prisma.caseTimelineEvent.create({
          data: {
            missingPersonId: newChild.id,
            eventType: "CREATED",
            description: "Mother filed report at Central Help Desk. Child missing for 15 mins.",
            actorName: "Sunita Patel",
            actorRole: "CITIZEN",
          },
        });

        await prisma.alertNotification.create({
          data: {
            title: "CRITICAL ALERT: Missing 6-Year-Old Child",
            message: "Aarav Patel separated from family near North Arena Lawn. Search perimeter: 850m.",
            type: "MISSING_PERSON",
            priority: "CRITICAL",
            targetRole: "ALL",
            linkUrl: `/missing-persons?case=${newChild.id}`,
          },
        });

        return NextResponse.json({
          success: true,
          step: 1,
          title: "Missing Child Reported",
          message: "Aarav (6yo) reported missing. AI calculated 850m search radius. Alert broadcast to authorized personnel.",
          data: newChild,
        });
      }

      case "STEP_2_DISPATCH_SEARCH": {
        const child = await prisma.missingPerson.findFirst({
          where: { type: "CHILD", status: { not: "FOUND_SAFE" } },
        });
        const teamDelta = await prisma.responseTeam.findFirst({
          where: { type: "SEARCH_RESCUE" },
        });

        if (child && teamDelta) {
          await prisma.missingPerson.update({
            where: { id: child.id },
            data: {
              status: "SEARCH_DISPATCHED",
              assignedTeamId: teamDelta.id,
            },
          });

          await prisma.responseTeam.update({
            where: { id: teamDelta.id },
            data: { status: "DISPATCHED" },
          });

          await prisma.caseTimelineEvent.create({
            data: {
              missingPersonId: child.id,
              eventType: "DISPATCHED",
              description: `Command Center dispatched ${teamDelta.name} to sweep North Lawn grid sector.`,
              actorName: "Commander Anita Deshmukh",
              actorRole: "ADMIN",
            },
          });

          return NextResponse.json({
            success: true,
            step: 2,
            title: "Search & Rescue Team Dispatched",
            message: `${teamDelta.name} dispatched with search grid coordinates. Volunteers alerted.`,
          });
        }
        return NextResponse.json({ success: false, message: "Missing child or search team not found." });
      }

      case "STEP_3_CROWD_SURGE": {
        const exitZone = await prisma.crowdZone.findFirst({
          where: { category: "EXIT" },
        });

        if (exitZone) {
          const surgeCount = Math.round(exitZone.capacity * 0.93);
          const updatedZone = await prisma.crowdZone.update({
            where: { id: exitZone.id },
            data: {
              currentCount: surgeCount,
              densityRatio: 0.93,
              riskLevel: "CRITICAL",
              alertActive: true,
              alertMessage: "CRITICAL DENSITY SURGE: 93% capacity reached at South Exit Gate B! Turnstiles jammed.",
            },
          });

          await prisma.alertNotification.create({
            data: {
              title: "CRITICAL CROWD SURGE: South Exit Gate B",
              message: "93% capacity exceeded. Severe bottleneck forming. Urgent crowd dispersal required!",
              type: "CROWD",
              priority: "CRITICAL",
              targetRole: "ALL",
              linkUrl: `/crowd-monitoring?zone=${exitZone.id}`,
            },
          });

          return NextResponse.json({
            success: true,
            step: 3,
            title: "Exit Gate Crowd Surge Triggered",
            message: "Exit Gate B density reached 93%. Automated hazard alarm activated in Command Center.",
            data: updatedZone,
          });
        }
        return NextResponse.json({ success: false, message: "Exit zone not found." });
      }

      case "STEP_4_DISPATCH_CROWD": {
        const exitZone = await prisma.crowdZone.findFirst({ where: { category: "EXIT" } });
        const crowdTeam = await prisma.responseTeam.findFirst({ where: { type: "CROWD_CONTROL" } });

        if (exitZone && crowdTeam) {
          await prisma.crowdZone.update({
            where: { id: exitZone.id },
            data: { assignedTeamId: crowdTeam.id },
          });

          await prisma.responseTeam.update({
            where: { id: crowdTeam.id },
            data: { status: "ON_SCENE" },
          });

          await prisma.auditLog.create({
            data: {
              action: "CROWD_TEAM_DEPLOYED",
              actorName: "Commander Anita Deshmukh",
              actorRole: "ADMIN",
              targetEntity: "CrowdZone",
              targetId: exitZone.id,
              details: `Deployed ${crowdTeam.name} to establish secondary exit lanes.`,
            },
          });

          return NextResponse.json({
            success: true,
            step: 4,
            title: "Crowd Control Squad Deployed",
            message: `${crowdTeam.name} deployed on scene at Exit Gate B. Secondary barriers opened.`,
          });
        }
        return NextResponse.json({ success: false, message: "Zone or team not found." });
      }

      case "STEP_5_SAFE_JOURNEY_DEVIATION": {
        const journey = await prisma.safeJourney.findFirst({
          where: { status: "ACTIVE" },
        });

        if (journey) {
          const updated = await prisma.safeJourney.update({
            where: { id: journey.id },
            data: {
              status: "DEVIATION_DETECTED",
              deviationTriggered: true,
              deviationReason: "Auto Rickshaw deviated 650m away from registered Highway path into dark unpaved service lane.",
              lastKnownLat: 19.0885,
              lastKnownLng: 72.8685,
            },
          });

          await prisma.alertNotification.create({
            data: {
              title: "SAFE JOURNEY ALERT: Route Deviation",
              message: "Priya Sharma's auto diverted from registered course. Safety check-in prompt issued.",
              type: "SAFE_JOURNEY",
              priority: "HIGH",
              targetRole: "ALL",
              linkUrl: "/safe-journey",
            },
          });

          return NextResponse.json({
            success: true,
            step: 5,
            title: "Safe Journey Route Deviation Detected",
            message: "Commuter route deviation detected. Interactive prompt: 'Route deviation detected. Are you safe?'",
            data: updated,
          });
        }
        return NextResponse.json({ success: false, message: "No active journey found." });
      }

      case "STEP_6_DUPLICATE_REPORT": {
        // Find existing chain snatching incident
        const masterInc = await prisma.incident.findFirst({
          where: { category: "CHAIN_SNATCHING", status: { not: "RESOLVED" } },
        });

        if (masterInc) {
          const duplicateReport = await prisma.incidentReport.create({
            data: {
              masterIncidentId: masterInc.id,
              rawDescription: "Witness 2: Two guys on black motorcycle just grabbed a gold chain near stall 12 and sped towards exit!",
              locationName: "East Food Boulevard Stall #12",
              latitude: 19.0773,
              longitude: 72.8804,
              reporterContact: "Kunal Shah (+91 98123 77665)",
              similarityScore: 0.94,
            },
          });

          await prisma.caseTimelineEvent.create({
            data: {
              incidentId: masterInc.id,
              eventType: "DUPLICATE_CLUSTER_LINKED",
              description: `AI Correlated 2nd witness report (Kunal Shah) with 94% confidence. Master incident updated.`,
              actorName: "AI Duplicate Cluster Engine",
              actorRole: "SYSTEM",
            },
          });

          return NextResponse.json({
            success: true,
            step: 6,
            title: "AI Duplicate Incident Clustered",
            message: "Incoming witness report matched Master INC-2026-002 with 94% similarity. Consolidated into single incident dossier.",
            data: duplicateReport,
          });
        }
        return NextResponse.json({ success: false, message: "Master incident not found." });
      }

      case "STEP_7_CHILD_SIGHTING_FOUND": {
        const child = await prisma.missingPerson.findFirst({
          where: { type: "CHILD", status: { not: "FOUND_SAFE" } },
        });

        if (child) {
          // 1. Submit verified sighting
          const sighting = await prisma.sighting.create({
            data: {
              missingPersonId: child.id,
              reporterName: "Volunteer Vikram Jadhav (VOL-204)",
              reporterPhone: "+91 98200 11223",
              locationName: "Help Desk Booth #2 near Ice Cream Stall",
              latitude: 19.0762,
              longitude: 72.8778,
              description: "Child matching Aarav's description (red shirt, blue bottle) sitting safely with booth volunteer.",
              verificationStatus: "VERIFIED",
              verifiedBy: "Inspector Rajesh Rathore",
            },
          });

          // 2. Mark child as FOUND_SAFE
          await prisma.missingPerson.update({
            where: { id: child.id },
            data: { status: "FOUND_SAFE" },
          });

          await prisma.caseTimelineEvent.create({
            data: {
              missingPersonId: child.id,
              eventType: "FOUND_SAFE",
              description: `Aarav safely reunited with mother Sunita Patel! Case successfully resolved.`,
              actorName: "Commander Anita Deshmukh",
              actorRole: "ADMIN",
            },
          });

          return NextResponse.json({
            success: true,
            step: 7,
            title: "Missing Child Located & Reunited",
            message: "Volunteer sighting verified by police. Aarav safely reunited with his mother. Case resolved!",
            data: sighting,
          });
        }
        return NextResponse.json({ success: false, message: "Child case not found." });
      }

      case "STEP_8_RESOLVE_ALL": {
        // Resolve crowd surge and mark safe
        await prisma.crowdZone.updateMany({
          data: {
            currentCount: 1800,
            densityRatio: 0.38,
            riskLevel: "LOW",
            alertActive: false,
            alertMessage: null,
          },
        });

        await prisma.incident.updateMany({
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "REPORTED"] } },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          step: 8,
          title: "Operations Resolved & Live Analytics Updated",
          message: "All operational threats neutralized, exit traffic normalized, response times recorded.",
        });
      }

      default:
        return NextResponse.json({ error: "Invalid demo step." }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}