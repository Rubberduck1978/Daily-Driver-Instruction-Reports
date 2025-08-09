// src/app/api/instructions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const instructions = await db.driverInstructions.findMany({
      orderBy: {
        "Created at": 'desc'
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
        "Driver ID": employeeNumber || null,
        "Route": route,
        "Run No": runningNumber,
        "Headway Deviation": headwayDeviation ? parseFloat(headwayDeviation) : null,
        "Delay": earlyLate ? parseInt(earlyLate) : null,
        "Instruction": instruction,
        "Status": 'pending',
        "Created at": new Date(),
        "Updated at": new Date()
      }
    });
    
    return NextResponse.json(newInstruction, { status: 201 });
  } catch (error) {
    console.error('Error creating instruction:', error);
    return NextResponse.json({ error: 'Failed to create instruction' }, { status: 500 });
  }
}
