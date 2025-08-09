// src/app/api/instructions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const instructions = await db.driverInstructions.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(instructions);
  } catch (error) {
    console.error('Error fetching instructions:', error);
    return NextResponse.json({ error: 'Failed to fetch instructions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeNumber, route, runningNumber, headwayDeviation, earlyLate, communicationType, instruction } = body;
    
    const newInstruction = await db.driverInstructions.create({
      data: {
        driverId: employeeNumber || null,
        route: route,
        runNo: runningNumber,
        headwayDeviation: headwayDeviation ? parseFloat(headwayDeviation) : null,
        delay: earlyLate ? parseInt(earlyLate) : null,
        instruction: instruction,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(newInstruction, { status: 201 });
  } catch (error) {
    console.error('Error creating instruction:', error);
    return NextResponse.json({ error: 'Failed to create instruction' }, { status: 500 });
  }
}
