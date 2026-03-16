import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Volunteer } from '@/models/Volunteer';
import School from '@/models/School';
import VolunteerRequest from '@/models/VolunteerRequest';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { volunteerUid, schoolUid, action } = body;

    if (!volunteerUid || !schoolUid || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Volunteer UID, School UID, and action are required' 
      }, { status: 400 });
    }

    // Find volunteer
    const volunteer = await Volunteer.findOne({ 
      uid: volunteerUid, 
      ngoUid: decoded.uid 
    });
    
    if (!volunteer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Volunteer not found' 
      }, { status: 404 });
    }

    // Find school
    const school = await School.findOne({ 
      uid: schoolUid, 
      ngoUid: decoded.uid 
    });
    
    if (!school) {
      return NextResponse.json({ 
        success: false, 
        message: 'School not found' 
      }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'assign':
        // Assign volunteer to school
        volunteer.assignedSchoolUid = schoolUid;
        
        // Update school's assigned volunteers
        if (!school.assignedVolunteers) {
          school.assignedVolunteers = [];
        }
        if (!school.assignedVolunteers.includes(volunteerUid)) {
          school.assignedVolunteers.push(volunteerUid);
        }
        
        await volunteer.save();
        await school.save();
        
        return NextResponse.json({
          success: true,
          message: 'Volunteer assigned to school successfully',
          assignment: {
            volunteerUid: volunteer.uid,
            volunteerName: volunteer.name,
            schoolUid: school.uid,
            schoolName: school.schoolName,
            district: school.district
          }
        });

      case 'unassign':
        // Remove volunteer from school
        volunteer.assignedSchoolUid = undefined;
        
        // Update school's assigned volunteers
        if (school.assignedVolunteers) {
          school.assignedVolunteers = school.assignedVolunteers.filter(
            (uid: string) => uid !== volunteerUid
          );
        }
        
        await volunteer.save();
        await school.save();
        
        return NextResponse.json({
          success: true,
          message: 'Volunteer unassigned from school successfully',
          assignment: {
            volunteerUid: volunteer.uid,
            volunteerName: volunteer.name,
            schoolUid: school.uid,
            schoolName: school.schoolName
          }
        });

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action. Use "assign" or "unassign"' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('NGO Volunteer Assignment Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters for smart matching
    const { searchParams } = new URL(request.url);
    const schoolUid = searchParams.get('schoolUid');
    const subject = searchParams.get('subject');
    const classLevel = searchParams.get('class');

    if (!schoolUid) {
      return NextResponse.json({ 
        success: false, 
        message: 'School UID is required for matching' 
      }, { status: 400 });
    }

    // Find school
    const school = await School.findOne({ 
      uid: schoolUid, 
      ngoUid: decoded.uid 
    });
    
    if (!school) {
      return NextResponse.json({ 
        success: false, 
        message: 'School not found' 
      }, { status: 404 });
    }

    // Build smart matching query
    const matchQuery: any = {
      ngoUid: decoded.uid,
      verificationStatus: 'verified',
      isActive: true
    };

    // District matching (highest priority)
    matchQuery.preferredDistrict = school.district;

    // Subject matching
    if (subject) {
      matchQuery.preferredSubjects = { $in: [subject] };
    }

    // Class matching
    if (classLevel) {
      matchQuery.preferredClasses = { $in: [classLevel] };
    }

    // Get matching volunteers
    const volunteers = await Volunteer.find(matchQuery).sort({ ratingAverage: -1 });

    // Calculate match scores and rank volunteers
    const scoredVolunteers = volunteers.map(volunteer => {
      let score = 0;
      
      // Base score for being verified and active
      score += 10;
      
      // District match (highest weight)
      if (volunteer.preferredDistrict === school.district) {
        score += 30;
      }
      
      // Subject matches
      if (subject && volunteer.preferredSubjects.includes(subject)) {
        score += 20;
      }
      
      // Class matches
      if (classLevel && volunteer.preferredClasses.includes(classLevel)) {
        score += 15;
      }
      
      // Rating bonus
      score += (volunteer.ratingAverage || 0) * 2;
      
      // Experience bonus (based on sessions completed)
      score += (volunteer.totalSessions || 0) * 0.1;
      
      // Availability bonus (check if volunteer has availability)
      if (volunteer.availability && volunteer.availability.length > 0) {
        score += 5;
      }
      
      return {
        uid: volunteer.uid,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        skills: volunteer.skills,
        preferredSubjects: volunteer.preferredSubjects,
        preferredClasses: volunteer.preferredClasses,
        preferredDistrict: volunteer.preferredDistrict,
        ratingAverage: volunteer.ratingAverage || 0,
        totalSessions: volunteer.totalSessions || 0,
        totalHours: volunteer.totalHours || 0,
        studentsTaught: volunteer.studentsTaught || 0,
        isCurrentlyAssigned: volunteer.assignedSchoolUid === schoolUid,
        matchScore: Math.round(score * 10) / 10,
        matchReasons: getMatchReasons(volunteer, school, subject || undefined, classLevel || undefined)
      };
    });

    // Sort by match score (highest first)
    scoredVolunteers.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      school: {
        uid: school.uid,
        schoolName: school.schoolName,
        district: school.district,
        state: school.state
      },
      matchingCriteria: {
        subject: subject || 'any',
        class: classLevel || 'any',
        district: school.district
      },
      volunteers: scoredVolunteers,
      total: scoredVolunteers.length
    });

  } catch (error) {
    console.error('NGO Volunteer Matching Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to get match reasons
function getMatchReasons(volunteer: any, school: any, subject?: string, classLevel?: string): string[] {
  const reasons = [];
  
  if (volunteer.preferredDistrict === school.district) {
    reasons.push('District match');
  }
  
  if (subject && volunteer.preferredSubjects.includes(subject)) {
    reasons.push('Subject match');
  }
  
  if (classLevel && volunteer.preferredClasses.includes(classLevel)) {
    reasons.push('Class match');
  }
  
  if (volunteer.ratingAverage >= 4.5) {
    reasons.push('Highly rated');
  }
  
  if (volunteer.totalSessions > 10) {
    reasons.push('Experienced');
  }
  
  if (volunteer.isCurrentlyAssigned) {
    reasons.push('Currently assigned');
  }
  
  return reasons;
}
