import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import { NGO } from "@/models/NGO";
import { School } from "@/models/School";
import { Volunteer } from "@/models/Volunteer";
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

    let updatedEntity = null;

    switch (type) {
      case "ngo": {
        const existing = await NGO.findOne({ ngoUid: uid });
        if (!existing) break;

        updatedEntity = await NGO.findOneAndUpdate(
          { ngoUid: uid },
          {
            verifiedStatus:
              existing.verifiedStatus === "verified"
                ? "pending"
                : "verified",
          },
          { new: true }
        );
        break;
      }

      case "school": {
        const existing = await School.findOne({ schoolUid: uid });
        if (!existing) break;

        updatedEntity = await School.findOneAndUpdate(
          { schoolUid: uid },
          {
            verificationStatus:
              existing.verificationStatus === "verified"
                ? "pending"
                : "verified",
          },
          { new: true }
        );
        break;
      }

      case "volunteer": {
        const existing = await Volunteer.findOne({ volunteerUid: uid });
        if (!existing) break;

        updatedEntity = await Volunteer.findOneAndUpdate(
          { volunteerUid: uid },
          {
            status: "active"
          },
          { new: true }
        );
        break;
      }

      case "student": {
        const existing = await Student.findOne({ studentUid: uid });
        if (!existing) break;

        updatedEntity = await Student.findOneAndUpdate(
          { studentUid: uid },
          { verified: !existing.verified },
          { new: true }
        );
        break;
      }

      case "donor": {
        const existing = await Donor.findOne({ donorUid: uid });
        if (!existing) break;

        updatedEntity = await Donor.findOneAndUpdate(
          { donorUid: uid },
          {
            verifiedStatus:
              existing.verifiedStatus === "verified"
                ? "pending"
                : "verified",
          },
          { new: true }
        );
        break;
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid entity type" },
          { status: 400 }
        );
    }

    if (!updatedEntity) {
      return NextResponse.json(
        { success: false, message: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} verification updated`,
      data: updatedEntity,
    });

  } catch (error) {
    console.error("Admin verify error:", error);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
