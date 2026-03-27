import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VolunteerRequest from '@/models/VolunteerRequest';
import School from '@/models/School';
import { Volunteer } from '@/models/Volunteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    console.log('=== DEBUG: Requests API Token UID ===', decoded.uid);
    console.log('=== DEBUG: Requests API NGO UID ===', decoded.ngoUid);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const urgency = searchParams.get('urgency');

    // Build query
    const query: any = {};
    
    // Get all schools managed by this NGO
    const schools = await School.find({ ngoUid: decoded.uid });
    const schoolUids = schools.map(s => s.uid);
    
    query.schoolUid = { $in: schoolUids };
    
    if (status) {
      query.status = status;
    }
    
    if (subject) {
      query.subjectsRequired = { $in: [subject] };
    }
    
    if (urgency) {
      // We'll need to add urgency field to VolunteerRequest schema
      // For now, we'll skip this filter
    }

    // Get requests
    const requests = await VolunteerRequest.find(query).sort({ createdAt: -1 });
    
    // Get schools for reference
    const schoolMap = new Map(schools.map(s => [s.uid, s]));

    // Enrich request data
    const enrichedRequests = requests.map(request => {
      const school = schoolMap.get(request.schoolUid);
      
      return {
        requestId: request.requestId,
        schoolUid: request.schoolUid,
        school: school ? {
          uid: school.uid,
          schoolName: school.schoolName,
          district: school.district,
          state: school.state
        } : null,
        subjectsRequired: request.subjectsRequired,
        classesRequired: request.classesRequired,
        volunteersNeeded: request.volunteersNeeded,
        district: request.district,
        state: request.state,
        status: request.status,
        urgency: calculateUrgency(request.createdAt, request.status),
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      requests: enrichedRequests,
      total: requests.length
    });

  } catch (error) {
    console.error('NGO Requests Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to calculate urgency based on age and status
function calculateUrgency(createdAt: Date, status: string): 'high' | 'medium' | 'low' {
  if (status === 'filled' || status === 'closed') {
    return 'low';
  }
  
  const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysOld > 14) return 'high';
  if (daysOld > 7) return 'medium';
  return 'low';
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies (fallback)
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('token')?.value;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    // Verify token and get NGO UID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body: any = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Request ID and action are required' 
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

    // Handle different actions
    switch (action) {
      case 'close':
        volunteerRequest.status = 'closed';
        break;
        
      case 'reopen':
        volunteerRequest.status = 'open';
        break;
        
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }

    await volunteerRequest.save();

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
      request: {
        requestId: volunteerRequest.requestId,
        status: volunteerRequest.status
      }
    });

  } catch (error) {
    console.error('NGO Request Action Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
