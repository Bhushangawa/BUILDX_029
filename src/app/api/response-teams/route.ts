import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const teams = await prisma.responseTeam.findMany({
      include: {
        incidents: {
          where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
        },
        missingPersons: {
          where: { status: { notIn: ["FOUND_SAFE", "CLOSED"] } },
        },
      },
    });

    return NextResponse.json({ teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, status, currentLatitude, currentLongitude, currentLocationName } = body;

    const data: any = {};
    if (status) data.status = status;
    if (currentLatitude !== undefined) data.currentLatitude = currentLatitude;
    if (currentLongitude !== undefined) data.currentLongitude = currentLongitude;
    if (currentLocationName) data.currentLocationName = currentLocationName;

    const updated = await prisma.responseTeam.update({
      where: { id: teamId },
      data,
    });

    return NextResponse.json({ success: true, team: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}