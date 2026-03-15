import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import { NGO } from "@/models/NGO";
import { School } from "@/models/School";
import { Volunteer } from "@/models/VolunteerNew";
import { Student } from "@/models/Student";
import { Donor } from "@/models/Donor";

export async function GET() {
  try {
    await dbConnect();

    /* =========================
       FETCH DATA
    ========================= */

    const [ngos, schools, volunteers, students, donors] = await Promise.all([
      NGO.find({}).lean(),
      School.find({}).lean(),
      Volunteer.find({}).lean(),
      Student.find({}).lean(),
      Donor.find({}).lean()
    ]);

    /* =========================
       CALCULATE STATS
    ========================= */

    const stats = {
      totalNGOs: ngos.length,
      verifiedNGOs: ngos.filter((n) => n.verifiedStatus === "verified").length,

      totalSchools: schools.length,
      verifiedSchools: schools.filter(
        (s) => s.verificationStatus === "verified"
      ).length,

      totalVolunteers: volunteers.length,
      verifiedVolunteers: volunteers.filter(
        (v) => v.verificationStatus === "verified"
      ).length,

      totalStudents: students.length,
      verifiedStudents: students.filter((s) => s.verified === true).length,

      totalDonors: donors.length,
      verifiedDonors: donors.filter(
        (d) => d.verifiedStatus === "verified"
      ).length
    };

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json({
      success: true,
      data: {
        ngos,
        schools,
        volunteers,
        students,
        donors,
        stats
      }
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admin dashboard"
      },
      { status: 500 }
    );
  }
}
