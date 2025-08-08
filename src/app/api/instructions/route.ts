import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const instructions = await db.instruction.findMany({
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
    const { driverId, route, run, deviation, delay, instruction } = body;
    
    const newInstruction = await db.instruction.create({
      data: {
        driverId,
        route,
        run,
        deviation,
        delay,
        instruction,
        status: 'pending'
      }
    });
    
    return NextResponse.json(newInstruction, { status: 201 });
  } catch (error) {
    console.error('Error creating instruction:', error);
    return NextResponse.json({ error: 'Failed to create instruction' }, { status: 500 });
  }
}
