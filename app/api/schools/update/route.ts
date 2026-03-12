import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { School } from '@/models/refactored/SchoolSimple';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    console.log('=== 🏫 UPDATING EXISTING SCHOOLS WITH FACILITIES ===');

    // Update existing schools to have proper facilities
    const updateResult = await School.updateMany(
      { 
        $or: [
          { facilities: { $exists: false } },
          { facilities: null }
        ]
      },
      {
        $set: {
          facilities: {
            hostel: true,
            sports: true,
            scienceLab: true,
            digitalClassroom: false,
            library: true,
            computerLab: false
          },
          streamsOffered: ['science', 'arts', 'commerce']
        }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} schools with facilities`);

    // Get updated schools
    const schools = await School.find({}).select('-__v').lean();

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updateResult.modifiedCount} schools with facilities`,
      updatedCount: updateResult.modifiedCount,
      totalSchools: schools.length,
      schools: schools.map(school => ({
        id: school._id,
        name: school.schoolName,
        district: school.district,
        state: school.state,
        hostel: school.facilities?.hostel || false,
        studentsCount: school.studentsCount
      }))
    });

  } catch (error) {
    console.error('Update schools error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update schools with facilities',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
