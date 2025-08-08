import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const instructions = await db.driverInstruction.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json(instructions)
  } catch (error) {
    console.error('Error fetching instructions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instructions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeNumber, route, runningNumber, headwayDeviation, earlyLate, instruction, communicationType } = body

    if (!route || !runningNumber || !instruction) {
      return NextResponse.json(
        { error: 'Route, running number, and instruction are required' },
        { status: 400 }
      )
    }

    const newInstruction = await db.driverInstruction.create({
      data: {
        employeeNumber: employeeNumber || null,
        route,
        runningNumber,
        headwayDeviation: headwayDeviation || null,
        earlyLate: earlyLate || null,
        instruction,
        communicationType: communicationType || null,
        timestamp: new Date()
      }
    })

    return NextResponse.json(newInstruction, { status: 201 })
  } catch (error) {
    console.error('Error creating instruction:', error)
    return NextResponse.json(
      { error: 'Failed to create instruction' },
      { status: 500 }
    )
  }
}
