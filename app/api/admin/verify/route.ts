import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import { NGO } from "@/models/NGO";
import { School } from "@/models/School";
import { Volunteer } from "@/models/VolunteerNew";
import { Student } from "@/models/Student";
import { Donor } from "@/models/Donor";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { type, uid } = body;

    if (!type || !uid) {
      return NextResponse.json(
        { success: false, message: "Type and UID required" },
        { status: 400 }
      );
    }

    let entity = null;

    /* =========================
       VERIFY BASED ON TYPE
    ========================= */

    switch (type) {
      case "ngo": {
        entity = await NGO.findOne({ ngoUid: uid });

        if (!entity) break;

        entity.verifiedStatus =
          entity.verifiedStatus === "verified" ? "pending" : "verified";

        await entity.save();
        break;
      }

      case "school": {
        entity = await School.findOne({ uid });

        if (!entity) break;

        entity.verificationStatus =
          entity.verificationStatus === "verified" ? "pending" : "verified";

        await entity.save();
        break;
      }

      case "volunteer": {
        entity = await Volunteer.findOne({ uid });

        if (!entity) break;

        entity.verificationStatus =
          entity.verificationStatus === "verified" ? "pending" : "verified";

        await entity.save();
        break;
      }

      case "student": {
        entity = await Student.findOne({ uid });

        if (!entity) break;

        entity.verified = !entity.verified;

        await entity.save();
        break;
      }

      case "donor": {
        entity = await Donor.findOne({ uid });

        if (!entity) break;

        entity.verifiedStatus =
          entity.verifiedStatus === "verified" ? "pending" : "verified";

        await entity.save();
        break;
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid entity type" },
          { status: 400 }
        );
    }

    if (!entity) {
      return NextResponse.json(
        { success: false, message: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} verification updated`,
      data: entity
    });

  } catch (error) {
    console.error("Admin verify error:", error);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
