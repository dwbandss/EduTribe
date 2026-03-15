import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/dbConnect';
import { Student, Volunteer } from '@/models';

// Validation schema
const GetStudentVolunteerSchema = z.object({
  studentUid: z.string().min(1, 'Student UID is required')
});

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentUid = searchParams.get('studentUid');

    if (!studentUid) {
      return NextResponse.json(
        { success: false, message: 'Student UID is required' },
        { status: 400 }
      );
    }

    // Find student
    const student = await Student.findOne({ uid: studentUid });
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // If student has assigned volunteer, get volunteer details
    if (student.assignedVolunteerUid) {
      const volunteer = await Volunteer.findOne({ 
        uid: student.assignedVolunteerUid,
        isActive: true 
      });

      if (volunteer) {
        return NextResponse.json({
          success: true,
          message: 'Volunteer mentor found',
          data: {
            studentUid: student.uid,
            studentName: student.name,
            studentClass: student.class,
            studentSubjects: student.subjects,
            assignedVolunteer: {
              uid: volunteer.uid,
              name: volunteer.name,
              skills: volunteer.skills,
              preferredSubjects: volunteer.preferredSubjects,
              preferredClasses: volunteer.preferredClasses,
              ratingAverage: volunteer.ratingAverage,
              availability: volunteer.availability
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'No volunteer mentor assigned',
      data: {
        studentUid: student.uid,
        studentName: student.name,
        studentClass: student.class,
        studentSubjects: student.subjects,
        assignedVolunteer: null
      }
    });

  } catch (error) {
    console.error('Get student volunteer error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch student volunteer information' },
      { status: 500 }
    );
  }
}
