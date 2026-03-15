import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { VolunteerRequest, VolunteerApplication, VolunteerAssignment, School, Volunteer, Student, NGO } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const activities = [];

    // Recent volunteer applications accepted
    const recentAssignments = await VolunteerAssignment.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const assignment of recentAssignments) {
      const school = await School.findOne({ uid: assignment.schoolUid }).lean();
      const volunteer = await Volunteer.findOne({ uid: assignment.volunteerUid }).lean();
      
      if (school && volunteer) {
        activities.push({
          type: 'volunteer_assigned',
          message: `Volunteer ${volunteer.name} assigned to ${school.schoolName}`,
          timestamp: assignment.createdAt,
          details: {
            volunteerUid: assignment.volunteerUid,
            volunteerName: volunteer.name,
            schoolUid: assignment.schoolUid,
            schoolName: school.schoolName,
            subjects: assignment.subjects,
            classes: assignment.classes
          }
        });
      }
    }

    // Recent volunteer requests created
    const recentRequests = await VolunteerRequest.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    for (const request of recentRequests) {
      const school = await School.findOne({ uid: request.schoolUid }).lean();
      
      if (school) {
        activities.push({
          type: 'request_created',
          message: `${school.schoolName} created a new volunteer request`,
          timestamp: request.createdAt,
          details: {
            requestId: request.requestId,
            schoolUid: request.schoolUid,
            schoolName: school.schoolName,
            subjectsRequired: request.subjectsRequired,
            classesRequired: request.classesRequired,
            volunteersNeeded: request.volunteersNeeded
          }
        });
      }
    }

    // Recent student assignments
    const recentStudents = await Student.find({ assignedVolunteerUid: { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    for (const student of recentStudents) {
      if (student.assignedVolunteerUid) {
        const volunteer = await Volunteer.findOne({ uid: student.assignedVolunteerUid }).lean();
        const school = await School.findOne({ uid: student.schoolUid }).lean();
        
        if (volunteer && school) {
          activities.push({
            type: 'student_assigned',
            message: `Student ${student.name} assigned to volunteer ${volunteer.name}`,
            timestamp: student.updatedAt,
            details: {
              studentUid: student.uid,
              studentName: student.name,
              volunteerUid: student.assignedVolunteerUid,
              volunteerName: volunteer.name,
              schoolUid: student.schoolUid,
              schoolName: school.schoolName,
              class: student.class
            }
          });
        }
      }
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 recent activities
    });

  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
