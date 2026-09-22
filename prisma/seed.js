const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sentinel database with realistic hackathon festival data...");

  // Clean old data
  await prisma.caseTimelineEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.alertNotification.deleteMany();
  await prisma.sighting.deleteMany();
  await prisma.missingPerson.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.crowdZone.deleteMany();
  await prisma.responseTeam.deleteMany();
  await prisma.safeJourney.deleteMany();
  await prisma.trustedContact.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const citizen = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 98765 43210",
      role: "CITIZEN",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const volunteer = await prisma.user.create({
    data: {
      name: "Vikram Jadhav",
      email: "vikram.j@sentinel-volunteers.org",
      phone: "+91 98200 11223",
      role: "VOLUNTEER",
      department: "Youth Civic Volunteers",
      badgeNumber: "VOL-204",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const officer = await prisma.user.create({
    data: {
      name: "Inspector Rajesh Rathore",
      email: "rajesh.rathore@police.gov.in",
      phone: "+91 98111 22334",
      role: "SECURITY_STAFF",
      department: "Metropolitan Rapid Patrol Unit 4",
      badgeNumber: "SEC-091",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Commander Anita Deshmukh",
      email: "anita.deshmukh@control.sentinel.org",
      phone: "+91 98999 88776",
      role: "ADMIN",
      department: "Central Emergency Operations Center",
      badgeNumber: "CMD-001",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
  });

  // 2. Response Teams
  const teamAlpha = await prisma.responseTeam.create({
    data: {
      name: "Alpha Rapid Security Patrol",
      type: "SECURITY",
      leaderName: "Sub-Inspector Verma",
      contactRadio: "CH-04 (VHF 154.2)",
      memberCount: 5,
      status: "AVAILABLE",
      currentLatitude: 19.0780,
      currentLongitude: 72.8765,
      currentLocationName: "Near North Entry Gate 1",
    },
  });

  const teamBravo = await prisma.responseTeam.create({
    data: {
      name: "Bravo Crowd Dispersion Squad",
      type: "CROWD_CONTROL",
      leaderName: "Officer Kulkarni",
      contactRadio: "CH-02 (VHF 152.8)",
      memberCount: 8,
      status: "ON_SCENE",
      currentLatitude: 19.0732,
      currentLongitude: 72.8795,
      currentLocationName: "South Exit Gate B Perimeter",
    },
  });

  const teamDelta = await prisma.responseTeam.create({
    data: {
      name: "Delta Search & Rescue K9 Unit",
      type: "SEARCH_RESCUE",
      leaderName: "Sergeant Naik & K9 Hunter",
      contactRadio: "CH-07 (VHF 158.4)",
      memberCount: 6,
      status: "DISPATCHED",
      currentLatitude: 19.0760,
      currentLongitude: 72.8775,
      currentLocationName: "Main Arena Lawn Sector 3",
    },
  });

  const teamCharlie = await prisma.responseTeam.create({
    data: {
      name: "Charlie Paramedic First-Response",
      type: "MEDICAL",
      leaderName: "Dr. Arvind Mehta",
      contactRadio: "CH-09 (VHF 161.0)",
      memberCount: 4,
      status: "AVAILABLE",
      currentLatitude: 19.0772,
      currentLongitude: 72.8808,
      currentLocationName: "East Medical Emergency Station",
    },
  });

  const teamEcho = await prisma.responseTeam.create({
    data: {
      name: "Echo Public Assistance Help Desk",
      type: "HELP_DESK",
      leaderName: "Help Desk Lead Sneha Roy",
      contactRadio: "CH-01 (VHF 150.0)",
      memberCount: 4,
      status: "AVAILABLE",
      currentLatitude: 19.0754,
      currentLongitude: 72.8782,
      currentLocationName: "Central Help Desk Hub",
    },
  });

  // 3. Crowd Zones
  await prisma.crowdZone.createMany({
    data: [
      {
        zoneCode: "ZONE-ENTRY-1",
        name: "North Entry Gate 1",
        category: "ENTRY",
        capacity: 5000,
        currentCount: 2150,
        densityRatio: 0.43,
        riskLevel: "MEDIUM",
        alertActive: false,
        latitude: 19.0788,
        longitude: 72.8762,
        radiusMeters: 140,
        assignedTeamId: teamAlpha.id,
      },
      {
        zoneCode: "ZONE-EXIT-B",
        name: "South Exit Gate B",
        category: "EXIT",
        capacity: 4500,
        currentCount: 3950,
        densityRatio: 0.88,
        riskLevel: "CRITICAL",
        alertActive: true,
        alertMessage: "CRITICAL DENSITY SURGE: 88% capacity exceeded. Exit bottleneck forming.",
        latitude: 19.0732,
        longitude: 72.8795,
        radiusMeters: 180,
        assignedTeamId: teamBravo.id,
      },
      {
        zoneCode: "ZONE-STAGE-MAIN",
        name: "Main Arena & Stage Pavilion",
        category: "STAGE",
        capacity: 15000,
        currentCount: 10400,
        densityRatio: 0.69,
        riskLevel: "HIGH",
        alertActive: false,
        latitude: 19.0762,
        longitude: 72.8772,
        radiusMeters: 220,
        assignedTeamId: teamBravo.id,
      },
      {
        zoneCode: "ZONE-PARK-C",
        name: "North Parking Lot C",
        category: "PARKING",
        capacity: 3500,
        currentCount: 1200,
        densityRatio: 0.34,
        riskLevel: "LOW",
        alertActive: false,
        latitude: 19.0810,
        longitude: 72.8748,
        radiusMeters: 200,
      },
      {
        zoneCode: "ZONE-HELP-HUB",
        name: "Central Police & Help Desk",
        category: "HELP_DESK",
        capacity: 800,
        currentCount: 220,
        densityRatio: 0.27,
        riskLevel: "LOW",
        alertActive: false,
        latitude: 19.0754,
        longitude: 72.8782,
        radiusMeters: 90,
        assignedTeamId: teamEcho.id,
      },
      {
        zoneCode: "ZONE-MED-EAST",
        name: "East Medical Emergency Station",
        category: "MEDICAL",
        capacity: 400,
        currentCount: 95,
        densityRatio: 0.24,
        riskLevel: "LOW",
        alertActive: false,
        latitude: 19.0772,
        longitude: 72.8808,
        radiusMeters: 100,
        assignedTeamId: teamCharlie.id,
      },
      {
        zoneCode: "ZONE-VIP-TOWER",
        name: "VIP Enclosure & Control Tower",
        category: "RESTRICTED",
        capacity: 500,
        currentCount: 130,
        densityRatio: 0.26,
        riskLevel: "LOW",
        alertActive: false,
        latitude: 19.0740,
        longitude: 72.8752,
        radiusMeters: 110,
      },
    ],
  });

  // 4. Missing Persons
  const childCase = await prisma.missingPerson.create({
    data: {
      caseNumber: "MP-2026-042",
      type: "CHILD",
      fullName: "Aarav Patel",
      age: 6,
      gender: "Male",
      photoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=300",
      lastSeenLocation: "North Arena Lawn near Food Court",
      latitude: 19.0768,
      longitude: 72.8785,
      lastSeenTime: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
      clothingDescription: "Bright red t-shirt with cartoon print, blue denim shorts, white velcro sneakers",
      identifyingFeatures: "Small birthmark on right cheek, carries a blue water bottle strap",
      medicalConditions: "None reported. Responsive to name 'Aaru'.",
      contactPersonName: "Sunita Patel (Mother)",
      contactPhone: "+91 98201 55443",
      contactRelation: "Mother",
      searchRadiusMeters: 850,
      status: "SEARCH_DISPATCHED",
      isSensitive: true,
      assignedTeamId: teamDelta.id,
    },
  });

  await prisma.caseTimelineEvent.createMany({
    data: [
      {
        missingPersonId: childCase.id,
        eventType: "CREATED",
        description: "Missing child report filed by mother Sunita Patel at Help Desk.",
        actorName: "Help Desk Lead Sneha Roy",
        actorRole: "HELP_DESK",
        createdAt: new Date(Date.now() - 34 * 60 * 1000),
      },
      {
        missingPersonId: childCase.id,
        eventType: "AI_TRIAGED",
        description: "AI calculated 850m initial perimeter based on elapsed time and child walking speed.",
        actorName: "AI Incident Intelligence",
        actorRole: "SYSTEM",
        createdAt: new Date(Date.now() - 33 * 60 * 1000),
      },
      {
        missingPersonId: childCase.id,
        eventType: "VERIFIED",
        description: "Admin verified parent identity; sensitive child data masked from unauthorized public.",
        actorName: "Commander Anita Deshmukh",
        actorRole: "ADMIN",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        missingPersonId: childCase.id,
        eventType: "DISPATCHED",
        description: "Delta Search & Rescue K9 Unit dispatched to North Lawn perimeter.",
        actorName: "Commander Anita Deshmukh",
        actorRole: "ADMIN",
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
    ],
  });

  const elderlyCase = await prisma.missingPerson.create({
    data: {
      caseNumber: "MP-2026-043",
      type: "ELDERLY",
      fullName: "Gangadhar Kulkarni",
      age: 74,
      gender: "Male",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      lastSeenLocation: "Central Arena Pavilion near Water Station",
      latitude: 19.0758,
      longitude: 72.8770,
      lastSeenTime: new Date(Date.now() - 55 * 60 * 1000),
      clothingDescription: "White cotton kurta-pyjama, brown leather sandals, silver wristwatch",
      identifyingFeatures: "Black rimmed reading spectacles, walked with a slight limp",
      medicalConditions: "Mild memory lapse / Alzheimer, requires blood pressure medication",
      contactPersonName: "Milind Kulkarni (Son)",
      contactPhone: "+91 98330 99881",
      contactRelation: "Son",
      searchRadiusMeters: 1200,
      status: "VERIFIED",
      isSensitive: false,
    },
  });

  // 5. Incidents
  const incCrowd = await prisma.incident.create({
    data: {
      incidentNumber: "INC-2026-001",
      title: "Exit Gate B Dangerous Surge & Bottleneck",
      description: "Severe crowd buildup at South Exit Gate B. People pushing against turnstiles, exit gate partially obstructed.",
      category: "CROWD_ISSUE",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      escalationLevel: "NORMAL",
      latitude: 19.0732,
      longitude: 72.8795,
      locationName: "South Exit Gate B",
      reporterName: "Gate Marshal Ramesh",
      reporterPhone: "+91 98700 33441",
      aiCategorySuggestion: "CROWD_ISSUE",
      aiPrioritySuggestion: "CRITICAL",
      aiTeamSuggestion: "CROWD_CONTROL",
      aiSummary: "Automated sensor & field report: Surge at 88% capacity. Immediate dispersion unit required.",
      assignedTeamId: teamBravo.id,
      verifiedByAdmin: true,
      verifiedAt: new Date(Date.now() - 15 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 12 * 60 * 1000),
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    },
  });

  const incSnatch = await prisma.incident.create({
    data: {
      incidentNumber: "INC-2026-002",
      title: "Gold Chain Snatching by Two Men on Motorcycle",
      description: "Witness reported two men on black pulsar snatched a woman's gold chain near East Food Boulevard and fled toward Parking C.",
      category: "CHAIN_SNATCHING",
      priority: "HIGH",
      status: "ASSIGNED",
      escalationLevel: "NORMAL",
      latitude: 19.0772,
      longitude: 72.8805,
      locationName: "East Food Boulevard Stall #14",
      reporterName: "Kavita Rao",
      reporterPhone: "+91 98450 12987",
      aiCategorySuggestion: "CHAIN_SNATCHING",
      aiPrioritySuggestion: "HIGH",
      aiTeamSuggestion: "SECURITY",
      aiSummary: "Armed or vehicular theft. Suspect: 2 males on black pulsar. Advise perimeter gate lockdown.",
      assignedTeamId: teamAlpha.id,
      verifiedByAdmin: true,
      verifiedAt: new Date(Date.now() - 8 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  // Duplicate report linked to INC-2026-002
  await prisma.incidentReport.create({
    data: {
      masterIncidentId: incSnatch.id,
      rawDescription: "Ek pulsar wala banda aur uska dost kisi ladki ka mangalsutra kheench ke parking taraf bhag gaye.",
      locationName: "Food Court East Side",
      latitude: 19.0774,
      longitude: 72.8802,
      reporterContact: "Vendor Amit (+91 99123 45678)",
      similarityScore: 0.94,
    },
  });

  const incSuspicious = await prisma.incident.create({
    data: {
      incidentNumber: "INC-2026-003",
      title: "Unattended Dark Luggage Bag Under Bench",
      description: "Large black duffel bag left unattended under a wooden bench near Ticket Counter 4 for over 35 minutes.",
      category: "SUSPICIOUS_ACTIVITY",
      priority: "HIGH",
      status: "REPORTED",
      escalationLevel: "WARNING",
      latitude: 19.0785,
      longitude: 72.8758,
      locationName: "Ticket Counter 4 Promenade",
      isAnonymous: true,
      aiCategorySuggestion: "SUSPICIOUS_ACTIVITY",
      aiPrioritySuggestion: "HIGH",
      aiTeamSuggestion: "SECURITY",
      aiSummary: "Unclaimed baggage protocol. Recommend bomb disposal / security perimeter cordoning.",
      createdAt: new Date(Date.now() - 14 * 60 * 1000),
    },
  });

  // 6. Safe Journey
  await prisma.safeJourney.create({
    data: {
      userId: citizen.id,
      userName: "Priya Sharma",
      startLocation: "Metropolitan Arena Main Gate",
      destinationLocation: "Grand Metro Interchange Station",
      startLat: 19.0762,
      startLng: 72.8772,
      destLat: 19.0910,
      destLng: 72.8620,
      transportMode: "AUTO",
      status: "ACTIVE",
      isSafe: true,
      deviationTriggered: false,
      lastKnownLat: 19.0825,
      lastKnownLng: 72.8710,
      trustedContactName: "Rahul Sharma (Brother)",
      trustedContactPhone: "+91 98765 00000",
      startedAt: new Date(Date.now() - 12 * 60 * 1000),
    },
  });

  // 7. Trusted Contacts
  await prisma.trustedContact.createMany({
    data: [
      {
        userId: citizen.id,
        name: "Rahul Sharma",
        relationship: "Brother",
        phone: "+91 98765 00000",
        isPrimary: true,
      },
      {
        userId: citizen.id,
        name: "Sunita Sharma",
        relationship: "Mother",
        phone: "+91 98765 11111",
        isPrimary: false,
      },
    ],
  });

  // 8. Notifications
  await prisma.alertNotification.createMany({
    data: [
      {
        title: "CROWD SURGE ALERT: Exit Gate B",
        message: "Capacity threshold exceeded (88%). Bravo squad deployed to open secondary exit lane.",
        type: "CROWD",
        priority: "CRITICAL",
        targetRole: "ALL",
      },
      {
        title: "MISSING CHILD: Aarav Patel (6yo)",
        message: "Last seen near North Lawn. Red shirt, blue shorts. Search teams active.",
        type: "MISSING_PERSON",
        priority: "CRITICAL",
        targetRole: "VOLUNTEER",
      },
      {
        title: "ESCALATION WARNING: Incident INC-2026-003",
        message: "Unattended bag near Ticket Counter 4 unacknowledged for 14 minutes.",
        type: "INCIDENT",
        priority: "HIGH",
        targetRole: "ADMIN",
      },
    ],
  });

  // 9. Timeline events
  await prisma.caseTimelineEvent.createMany({
    data: [
      {
        incidentId: incCrowd.id,
        eventType: "CREATED",
        description: "Crowd density alarm triggered automatically by Gate Sensor #B2.",
        actorName: "Gate Sensor Network",
        actorRole: "SYSTEM",
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        incidentId: incCrowd.id,
        eventType: "DISPATCHED",
        description: "Bravo Crowd Dispersion Squad dispatched with megaphone & barricades.",
        actorName: "Commander Anita Deshmukh",
        actorRole: "ADMIN",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        incidentId: incCrowd.id,
        eventType: "ACKNOWLEDGED",
        description: "Officer Kulkarni confirmed team arrival on scene. Diverting foot traffic to Gate C.",
        actorName: "Officer Kulkarni",
        actorRole: "SECURITY_STAFF",
        createdAt: new Date(Date.now() - 12 * 60 * 1000),
      },
    ],
  });

  // 10. Audit Log
  await prisma.auditLog.createMany({
    data: [
      {
        action: "SYSTEM_INITIALIZED",
        actorName: "Commander Anita Deshmukh",
        actorRole: "ADMIN",
        targetEntity: "System",
        details: "Sentinel Unified Security Command Hub brought online for Metropolitan Mega Expo.",
      },
      {
        action: "TEAM_ASSIGNED",
        actorName: "Commander Anita Deshmukh",
        actorRole: "ADMIN",
        targetEntity: "Incident",
        targetId: incCrowd.id,
        details: "Assigned Bravo Crowd Dispersion Squad to Gate B surge.",
      },
      {
        action: "DUPLICATE_MERGE",
        actorName: "AI Cluster Engine",
        actorRole: "SYSTEM",
        targetEntity: "Incident",
        targetId: incSnatch.id,
        details: "Correlated secondary witness report (Pulsar bike snatch) with Master INC-2026-002 with 94% confidence.",
      },
    ],
  });

  console.log("Database seeded successfully with all festival scenarios!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
