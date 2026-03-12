import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Scholarship } from '@/models/refactored/Scholarship';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const scholarships = Array.isArray(body) ? body : [body];

    const result = await Scholarship.insertMany(scholarships);
    
    return NextResponse.json({
      success: true,
      message: `Added ${scholarships.length} scholarships`,
      data: result
    });
  } catch (error) {
    console.error('Add scholarships error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
