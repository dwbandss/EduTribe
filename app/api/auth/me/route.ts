import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JwtPayload } from '@/lib/auth/jwt';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Volunteer } from "@/models/Volunteer";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false });
    }

    const user = verifyToken(token) as JwtPayload;
    
    if (!user) {
      return NextResponse.json({ success: false });
    }

    // Fetch full profile from database based on role
    let profileData: any = {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    if (user.role === 'student') {
      console.log('=== STUDENT PROFILE DEBUG ===');
      console.log('Looking for student with uid:', user.uid);
      
      // Check all possible collections
      const Student = await import('@/models/Student').then(m => m.Student);
      const student = await Student.findOne({ uid: user.uid });
      console.log('Student collection:', student ? 'FOUND' : 'NOT FOUND');
      if (student) {
        console.log('Student data:', {
          name: student.name,
          state: student.state,
          category: student.category,
          class: student.class
        });
      }
      
      // Check old StudentProfile collection
      try {
        const OldStudentProfile = mongoose.model('StudentProfile');
        const oldStudent = await OldStudentProfile.findOne({ uid: user.uid });
        console.log('StudentProfile collection:', oldStudent ? 'FOUND' : 'NOT FOUND');
        if (oldStudent) {
          console.log('StudentProfile data:', {
            name: oldStudent.name,
            state: oldStudent.state,
            category: oldStudent.category,
            class: oldStudent.class
          });
        }
      } catch (error) {
        console.log('StudentProfile collection does not exist');
      }
      
      // Check User collection
      const userDoc = await User.findOne({ uid: user.uid });
      console.log('User collection:', userDoc ? 'FOUND' : 'NOT FOUND');
      if (userDoc) {
        console.log('User data:', {
          name: userDoc.name,
          state: userDoc.state,
          category: userDoc.category,
          class: userDoc.class
        });
      }
      
      console.log('=== END DEBUG ===');
      
      // Use the first available data source
      if (student) {
        profileData = {
          uid: user.uid,
          name: student.name || user.name,
          email: student.email || user.email,
          role: user.role,
          phone: student.phone || user.phone,
          class: student.class || '',
          state: student.state || '',
          category: student.category || '',
          currentInstitution: student.currentInstitution || '',
          targetCourses: student.targetCourses || '',
          schoolUid: student.schoolUid || '',
          income: student.income,
          marks: student.marks,
          verified: student.verified || false,
        };
        
        // If student has schoolUid, fetch school data
        if (student.schoolUid) {
          const School = await import('@/models/School').then(m => m.School);
          const school = await School.findOne({ uid: student.schoolUid });
          console.log('Found school:', school);
          if (school) {
            profileData.schoolData = {
              schoolName: school.schoolName || '',
              schoolUid: school.uid || '',
              district: school.district || '',
              state: school.state || '',
              phone: school.phone || '',
              address: school.address || '',
            };
          }
        }
      } else {
        // Try to find in the old StudentProfile collection
        try {
          const OldStudentProfile = mongoose.model('StudentProfile');
          const oldStudent = await OldStudentProfile.findOne({ uid: user.uid });
          
          if (oldStudent) {
            profileData = {
              uid: user.uid,
              name: oldStudent.name || user.name,
              email: oldStudent.email || user.email,
              role: user.role,
              phone: oldStudent.phone || user.phone,
              class: oldStudent.class || '',
              state: oldStudent.state || '',
              category: oldStudent.category || '',
              currentInstitution: oldStudent.currentInstitution || '',
              targetCourses: oldStudent.targetCourses || '',
              schoolUid: oldStudent.schoolUid || '',
              income: oldStudent.income,
              marks: oldStudent.marks,
            };
          }
        } catch (error) {
          console.log('No StudentProfile collection found');
        }
      }
    } else if (user.role === 'school') {
      const School = await import('@/models/School').then(m => m.School);
      const school = await School.findOne({ uid: user.uid });
      if (school) {
        profileData = {
          ...profileData,
          schoolName: school.schoolName || '',
          district: school.district || '',
          state: school.state || '',
          phone: school.phone || '',
          address: school.address || '',
        };
      }
    } else if (user.role === 'volunteer') {
      const Volunteer = await import('@/models/Volunteer').then(m => m.Volunteer);
      const volunteer = await Volunteer.findOne({ uid: user.uid });
      if (volunteer) {
        profileData = {
          ...profileData,
          skills: volunteer.skills || [],
          subjects: volunteer.subjects || [],
          preferredLocality: volunteer.preferredLocality || '',
          preferredDistrict: volunteer.preferredDistrict || '',
          preferredSubjects: volunteer.preferredSubjects || [],
          preferredClasses: volunteer.preferredClasses || [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: profileData,
    });
    
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
