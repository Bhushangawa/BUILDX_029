import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const roleCookie = req.cookies.get("sentinel_role")?.value || "ADMIN";
    
    // Find matching user for role
    let user = await prisma.user.findFirst({
      where: { role: roleCookie },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
    }

    return NextResponse.json({
      user,
      activeRole: roleCookie,
      availableRoles: [
        { id: "CITIZEN", label: "Citizen (Priya Sharma)", icon: "User" },
        { id: "VOLUNTEER", label: "Volunteer (Vikram Jadhav - VOL-204)", icon: "HeartHandshake" },
        { id: "SECURITY_STAFF", label: "Security Staff (Insp. Rathore - SEC-091)", icon: "ShieldCheck" },
        { id: "ADMIN", label: "Control Room / Admin (Cmdr. Deshmukh)", icon: "Sliders" },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role } = body;

    const validRoles = ["CITIZEN", "VOLUNTEER", "SECURITY_STAFF", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const res = NextResponse.json({ success: true, activeRole: role });
    res.cookies.set("sentinel_role", role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}