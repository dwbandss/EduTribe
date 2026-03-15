import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { VolunteerApplication, VolunteerRequest, VolunteerAssignment, Student } from '@/models';

// Validation schema
const ProcessApplicationSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  action: z.enum(['accept', 'reject']),
  subjects: z.array(z.string()).optional(),
  classes: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validation = ProcessApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { applicationId, action, subjects, classes } = validation.data;

    // Find application
    const application = await VolunteerApplication.findOne({ applicationId });
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Application has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Validate subjects and classes for acceptance
      if (!subjects || subjects.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Subjects are required when accepting application' },
          { status: 400 }
        );
      }
      if (!classes || classes.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Classes are required when accepting application' },
          { status: 400 }
        );
      }

      // Create volunteer assignment
      const assignment = new VolunteerAssignment({
        volunteerUid: application.volunteerUid,
        schoolUid: application.schoolUid,
        subjects,
        classes,
        startDate: new Date(),
        status: 'active'
      });

      await assignment.save();

      // Assign volunteer to students in those classes
      await Student.updateMany(
        { 
          schoolUid: application.schoolUid,
          class: { $in: classes }
        },
        { 
          assignedVolunteerUid: application.volunteerUid 
        }
      );

      // Update application status
      application.status = 'accepted';
      await application.save();

      // Update request status if all volunteers are assigned
      const request = await VolunteerRequest.findOne({ requestId: application.requestId });
      if (request) {
        const acceptedApplications = await VolunteerApplication.countDocuments({
          requestId: application.requestId,
          status: 'accepted'
        });
        
        if (acceptedApplications >= request.volunteersNeeded) {
          request.status = 'filled';
          await request.save();
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Application accepted and volunteer assigned',
        data: {
          applicationId: application.applicationId,
          volunteerUid: application.volunteerUid,
          schoolUid: application.schoolUid,
          subjects,
          classes,
          status: 'accepted',
          assignmentId: assignment._id
        }
      });

    } else {
      // Reject application
      application.status = 'rejected';
      await application.save();

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
        data: {
          applicationId: application.applicationId,
          status: 'rejected'
        }
      });
    }

  } catch (error) {
    console.error('Process application error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process application' },
      { status: 500 }
    );
  }
}
