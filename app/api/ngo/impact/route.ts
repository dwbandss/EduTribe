import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import NGO from '@/models/NGO';
import { Volunteer } from '@/models/Volunteer';
import School from '@/models/School';
import Session from '@/models/Session';
import Student from '@/models/Student';
import VolunteerRequest from '@/models/VolunteerRequest';
import jwt from 'jsonwebtoken';

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

    // Get query parameters for time filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year'; // 'month', 'quarter', 'year'
    const year = searchParams.get('year') || new Date().getFullYear();

    // Get NGO data
    const ngo = await NGO.findOne({ ngoUid: decoded.uid });
    if (!ngo) {
      return NextResponse.json({ success: false, message: 'NGO not found' }, { status: 404 });
    }

    // Get all data for this NGO
    const volunteers = await Volunteer.find({ ngoUid: decoded.uid });
    const schools = await School.find({ ngoUid: decoded.uid });
    const volunteerUids = volunteers.map(v => v.uid);
    const schoolUids = schools.map(s => s.uid);

    // Get sessions with date filtering
    const sessionQuery: any = { 
      ngoUid: decoded.uid,
      status: 'completed'
    };

    // Apply date filtering based on period
    const currentYear = parseInt(year.toString());
    const currentMonth = new Date().getMonth();
    
    if (period === 'month') {
      sessionQuery.date = {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      };
    } else if (period === 'quarter') {
      const quarter = Math.floor(currentMonth / 3);
      sessionQuery.date = {
        $gte: new Date(currentYear, quarter * 3, 1),
        $lt: new Date(currentYear, (quarter + 1) * 3, 1)
      };
    } else {
      sessionQuery.date = {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1)
      };
    }

    const sessions = await Session.find(sessionQuery);
    const requests = await VolunteerRequest.find({ 
      schoolUid: { $in: schoolUids } 
    });
    const students = await Student.find({ 
      schoolUid: { $in: schoolUids } 
    });

    // Calculate comprehensive impact metrics
    const impact = {
      // Core Metrics
      totalStudents: students.length,
      totalSessions: sessions.length,
      totalHours: Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60), // Convert to hours
      totalVolunteers: volunteers.length,
      totalSchools: schools.length,
      totalRequests: requests.length,

      // Quality Metrics
      averageSessionDuration: sessions.length > 0 
        ? Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length)
        : 0,
      averageStudentsPerSession: sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + (s.studentsCount || 0), 0) / sessions.length)
        : 0,
      averageVolunteerRating: volunteers.length > 0
        ? Math.round((volunteers.reduce((acc, v) => acc + (v.ratingAverage || 0), 0) / volunteers.length) * 10) / 10
        : 0,

      // Request Metrics
      requestsFilled: requests.filter(r => r.status === 'filled').length,
      requestsOpen: requests.filter(r => r.status === 'open').length,
      fillRate: requests.length > 0 
        ? Math.round((requests.filter(r => r.status === 'filled').length / requests.length) * 100)
        : 0,

      // Subject Distribution
      subjectImpact: sessions.reduce((acc, session) => {
        const subject = session.subject;
        if (!acc[subject]) {
          acc[subject] = {
            sessions: 0,
            students: 0,
            hours: 0
          };
        }
        acc[subject].sessions += 1;
        acc[subject].students += session.studentsCount || 0;
        acc[subject].hours += (session.duration || 0) / 60;
        return acc;
      }, {} as Record<string, { sessions: number; students: number; hours: number }>),

      // District Impact
      districtImpact: schools.reduce((acc, school) => {
        const district = school.district;
        if (!acc[district]) {
          acc[district] = {
            schools: 0,
            students: 0,
            volunteers: 0
          };
        }
        acc[district].schools += 1;
        
        // Count students in this district
        const districtStudents = students.filter(s => {
          const studentSchool = schools.find(sc => sc.uid === s.schoolUid);
          return studentSchool?.district === district;
        });
        acc[district].students = districtStudents.length;
        
        // Count volunteers in this district
        const districtVolunteers = volunteers.filter(v => v.preferredDistrict === district);
        acc[district].volunteers = districtVolunteers.length;
        
        return acc;
      }, {} as Record<string, { schools: number; students: number; volunteers: number }>),

      // Volunteer Performance
      volunteerPerformance: volunteers
        .filter(v => v.verificationStatus === 'verified')
        .map(volunteer => {
          const volunteerSessions = sessions.filter(s => s.volunteerUid === volunteer.uid);
          const totalHours = Math.round(volunteerSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
          const totalStudents = volunteerSessions.reduce((acc, s) => acc + (s.studentsCount || 0), 0);
          
          return {
            uid: volunteer.uid,
            name: volunteer.name,
            rating: volunteer.ratingAverage || 0,
            sessions: volunteerSessions.length,
            hours: totalHours,
            students: totalStudents,
            subjects: Array.from(new Set(volunteerSessions.map(s => s.subject)))
          };
        })
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 10), // Top 10 performers

      // Monthly Trends (for the selected period)
      monthlyTrends: calculateMonthlyTrends(sessions, period, currentYear),

      // Growth Metrics
      growthMetrics: {
        newVolunteers: volunteers.filter(v => {
          const createdYear = v.createdAt.getFullYear();
          return createdYear === currentYear;
        }).length,
        newSchools: schools.filter(s => {
          const createdYear = s.createdAt.getFullYear();
          return createdYear === currentYear;
        }).length,
        expansionDistricts: Array.from(new Set(schools.map(s => s.district))).length
      }
    };

    return NextResponse.json({
      success: true,
      impact,
      period,
      year: currentYear,
      ngo: {
        ngoUid: ngo.ngoUid,
        ngoName: ngo.ngoName,
        district: ngo.district
      }
    });

  } catch (error) {
    console.error('NGO Impact Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to calculate monthly trends
function calculateMonthlyTrends(sessions: any[], period: string, year: number) {
  const trends: any[] = [];
  
  if (period === 'month') {
    // Daily trends for current month
    const currentMonth = new Date().getMonth();
    const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = sessions.filter(s => 
        s.date.getDate() === day && 
        s.date.getMonth() === currentMonth
      );
      
      trends.push({
        label: `Day ${day}`,
        sessions: daySessions.length,
        students: daySessions.reduce((acc, s) => acc + (s.studentsCount || 0), 0),
        hours: Math.round(daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)
      });
    }
  } else if (period === 'quarter') {
    // Weekly trends for current quarter
    const quarter = Math.floor(new Date().getMonth() / 3);
    const startMonth = quarter * 3;
    
    for (let week = 0; week < 12; week++) {
      const weekStart = new Date(year, startMonth, week * 7 + 1);
      const weekEnd = new Date(year, startMonth, week * 7 + 7);
      
      const weekSessions = sessions.filter(s => 
        s.date >= weekStart && s.date <= weekEnd
      );
      
      trends.push({
        label: `Week ${week + 1}`,
        sessions: weekSessions.length,
        students: weekSessions.reduce((acc, s) => acc + (s.studentsCount || 0), 0),
        hours: Math.round(weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)
      });
    }
  } else {
    // Monthly trends for current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 0; month < 12; month++) {
      const monthSessions = sessions.filter(s => s.date.getMonth() === month);
      
      trends.push({
        label: months[month],
        sessions: monthSessions.length,
        students: monthSessions.reduce((acc, s) => acc + (s.studentsCount || 0), 0),
        hours: Math.round(monthSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)
      });
    }
  }
  
  return trends;
}
