import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VolunteerRequest from '@/models/VolunteerRequest';
import { Volunteer } from '@/models/Volunteer';
import School from '@/models/School';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body: any = await req.json();
    const { requestId, volunteerUid, action } = body;

    if (!requestId || !volunteerUid || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request ID, Volunteer UID, and action are required' 
      }, { status: 400 });
    }

    // Find volunteer request
    const volunteerRequest = await VolunteerRequest.findOne({ requestId });
    
    if (!volunteerRequest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request not found' 
      }, { status: 404 });
    }

    // Verify this request belongs to a school managed by this NGO
    const school = await School.findOne({ 
      uid: volunteerRequest.schoolUid, 
      ngoUid: decoded.uid 
    });
    
    if (!school) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request not found in your managed schools' 
      }, { status: 404 });
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

    // Handle different actions
    switch (action) {
      case 'assign':
        // Validate volunteer can take this request
        if (volunteerRequest.status !== 'open') {
          return NextResponse.json({ 
            success: false, 
            message: 'Request is not open for assignment' 
          }, { status: 400 });
        }

        if (!volunteer.isActive || volunteer.verificationStatus !== 'verified') {
          return NextResponse.json({ 
            success: false, 
            message: 'Volunteer is not eligible for assignment' 
          }, { status: 400 });
        }

        // Check if volunteer is already assigned to this school
        if (volunteer.assignedSchoolUid && volunteer.assignedSchoolUid !== volunteerRequest.schoolUid) {
          return NextResponse.json({ 
            success: false, 
            message: 'Volunteer is already assigned to another school' 
          }, { status: 400 });
        }

        // Assign volunteer to request
        if (!volunteer.assignedRequests) {
          volunteer.assignedRequests = [];
        }
        if (!volunteer.assignedRequests.includes(requestId)) {
          volunteer.assignedRequests.push(requestId);
        }

        // Assign volunteer to school if not already assigned
        if (!volunteer.assignedSchoolUid) {
          volunteer.assignedSchoolUid = volunteerRequest.schoolUid;
        }

        // Update school's assigned volunteers
        if (!school.assignedVolunteers) {
          school.assignedVolunteers = [];
        }
        if (!school.assignedVolunteers.includes(volunteerUid)) {
          school.assignedVolunteers.push(volunteerUid);
        }

        // Update school's active requests
        if (!school.activeRequests) {
          school.activeRequests = [];
        }
        if (!school.activeRequests.includes(requestId)) {
          school.activeRequests.push(requestId);
        }

        // Update request status if all volunteers are assigned
        if (volunteer.assignedRequests.length >= volunteerRequest.volunteersNeeded) {
          volunteerRequest.status = 'filled';
        }

        await volunteer.save();
        await school.save();
        await volunteerRequest.save();

        return NextResponse.json({
          success: true,
          message: 'Volunteer assigned to request successfully',
          assignment: {
            requestId: volunteerRequest.requestId,
            volunteerUid: volunteer.uid,
            volunteerName: volunteer.name,
            schoolUid: school.uid,
            schoolName: school.schoolName,
            subjects: volunteerRequest.subjectsRequired,
            classes: volunteerRequest.classesRequired,
            volunteerLoad: volunteer.assignedRequests.length,
            requestStatus: volunteerRequest.status
          }
        });

      case 'unassign':
        // Remove volunteer from request
        if (volunteer.assignedRequests) {
          volunteer.assignedRequests = volunteer.assignedRequests.filter(
            (id: string) => id !== requestId
          );
        }

        // Update request status back to open
        if (volunteerRequest.status === 'filled') {
          volunteerRequest.status = 'open';
        }

        // Update school's active requests
        if (school.activeRequests) {
          school.activeRequests = school.activeRequests.filter(
            (id: string) => id !== requestId
          );
        }

        // Remove volunteer from school if they have no other assigned requests
        if (volunteer.assignedRequests && volunteer.assignedRequests.length === 0) {
          volunteer.assignedSchoolUid = undefined;
          
          if (school.assignedVolunteers) {
            school.assignedVolunteers = school.assignedVolunteers.filter(
              (uid: string) => uid !== volunteerUid
            );
          }
        }

        await volunteer.save();
        await school.save();
        await volunteerRequest.save();

        return NextResponse.json({
          success: true,
          message: 'Volunteer unassigned from request successfully',
          assignment: {
            requestId: volunteerRequest.requestId,
            volunteerUid: volunteer.uid,
            volunteerName: volunteer.name,
            schoolUid: school.uid,
            schoolName: school.schoolName,
            requestStatus: volunteerRequest.status
          }
        });

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action. Use "assign" or "unassign"' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('NGO Request Assignment Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request ID is required' 
      }, { status: 400 });
    }

    // Find volunteer request
    const volunteerRequest = await VolunteerRequest.findOne({ requestId });
    
    if (!volunteerRequest) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request not found' 
      }, { status: 404 });
    }

    // Verify this request belongs to a school managed by this NGO
    const school = await School.findOne({ 
      uid: volunteerRequest.schoolUid, 
      ngoUid: decoded.uid 
    });
    
    if (!school) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request not found in your managed schools' 
      }, { status: 404 });
    }

    // Get all eligible volunteers for this request
    const eligibleVolunteers = await Volunteer.find({
      ngoUid: decoded.uid,
      verificationStatus: 'verified',
      isActive: true,
      preferredDistrict: school.district,
      $or: [
        { preferredSubjects: { $in: volunteerRequest.subjectsRequired } },
        { preferredClasses: { $in: volunteerRequest.classesRequired } }
      ]
    }).sort({ ratingAverage: -1 });

    // Get currently assigned volunteers
    const assignedVolunteerUids = await Volunteer.find({
      ngoUid: decoded.uid,
      assignedRequests: requestId
    }).select('uid name email ratingAverage');

    // Calculate match scores for eligible volunteers
    const scoredVolunteers = eligibleVolunteers.map(volunteer => {
      let score = 0;
      
      // Subject matches
      const subjectMatches = volunteerRequest.subjectsRequired.filter((subject: string) => 
        volunteer.preferredSubjects.includes(subject)
      ).length;
      score += subjectMatches * 25;
      
      // Class matches
      const classMatches = volunteerRequest.classesRequired.filter((classLevel: string) => 
        volunteer.preferredClasses.includes(classLevel)
      ).length;
      score += classMatches * 20;
      
      // Rating bonus
      score += (volunteer.ratingAverage || 0) * 5;
      
      // Experience bonus
      score += (volunteer.totalSessions || 0) * 0.5;
      
      // Availability bonus
      if (volunteer.availability && volunteer.availability.length > 0) {
        score += 10;
      }
      
      // Deduction if already heavily loaded
      const currentLoad = volunteer.assignedRequests ? volunteer.assignedRequests.length : 0;
      score -= currentLoad * 5;
      
      return {
        uid: volunteer.uid,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        skills: volunteer.skills,
        preferredSubjects: volunteer.preferredSubjects,
        preferredClasses: volunteer.preferredClasses,
        ratingAverage: volunteer.ratingAverage || 0,
        totalSessions: volunteer.totalSessions || 0,
        totalHours: volunteer.totalHours || 0,
        currentLoad: currentLoad,
        isAssigned: assignedVolunteerUids.some(v => v.uid === volunteer.uid),
        matchScore: Math.round(score * 10) / 10,
        subjectMatches,
        classMatches
      };
    });

    // Sort by match score (highest first)
    scoredVolunteers.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      request: {
        requestId: volunteerRequest.requestId,
        schoolUid: volunteerRequest.schoolUid,
        schoolName: school.schoolName,
        district: school.district,
        subjectsRequired: volunteerRequest.subjectsRequired,
        classesRequired: volunteerRequest.classesRequired,
        volunteersNeeded: volunteerRequest.volunteersNeeded,
        status: volunteerRequest.status,
        createdAt: volunteerRequest.createdAt
      },
      assignedVolunteers: assignedVolunteerUids,
      eligibleVolunteers: scoredVolunteers,
      stats: {
        totalEligible: scoredVolunteers.length,
        totalAssigned: assignedVolunteerUids.length,
        remainingNeeded: Math.max(0, volunteerRequest.volunteersNeeded - assignedVolunteerUids.length),
        fillRate: Math.round((assignedVolunteerUids.length / volunteerRequest.volunteersNeeded) * 100)
      }
    });

  } catch (error) {
    console.error('NGO Request Matching Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
