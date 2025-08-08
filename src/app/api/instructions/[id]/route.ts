import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { employeeNumber, timestamp } = body

    const existingInstruction = await db.driverInstruction.findUnique({
      where: { id: params.id }
    })

    if (!existingInstruction) {
      return NextResponse.json(
        { error: 'Instruction not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (employeeNumber !== undefined) {
      updateData.employeeNumber = employeeNumber || null
    }
    
    if (timestamp !== undefined) {
      updateData.timestamp = new Date(timestamp)
    }

    const updatedInstruction = await db.driverInstruction.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedInstruction)
  } catch (error) {
    console.error('Error updating instruction:', error)
    return NextResponse.json(
      { error: 'Failed to update instruction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingInstruction = await db.driverInstruction.findUnique({
      where: { id: params.id }
    })

    if (!existingInstruction) {
      return NextResponse.json(
        { error: 'Instruction not found' },
        { status: 404 }
      )
    }

    await db.driverInstruction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Instruction deleted successfully' })
  } catch (error) {
    console.error('Error deleting instruction:', error)
    return NextResponse.json(
      { error: 'Failed to delete instruction' },
      { status: 500 }
    )
  }
}