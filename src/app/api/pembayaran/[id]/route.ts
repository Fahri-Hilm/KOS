import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET /api/pembayaran/[id] - Get pembayaran detail by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Fetch pembayaran with relations
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        penyewa: {
          select: {
            id: true,
            nama: true,
            email: true,
            noHp: true,
          }
        },
        kamar: {
          select: {
            id: true,
            nomorKamar: true,
            tipe: true,
            lantai: true,
            hargaPerBulan: true,
          }
        }
      }
    })

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, message: 'Pembayaran not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pembayaran
    })

  } catch (error) {
    console.error('GET /api/pembayaran/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/pembayaran/[id] - Update pembayaran
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if pembayaran exists
    const existing = await prisma.pembayaran.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pembayaran not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      ...(body.tanggalBayar && { tanggalBayar: new Date(body.tanggalBayar) }),
      ...(body.jatuhTempo && { jatuhTempo: new Date(body.jatuhTempo) }),
      ...(body.jumlah !== undefined && { jumlah: parseFloat(body.jumlah) }),
      ...(body.metodePembayaran && { metodePembayaran: body.metodePembayaran }),
      ...(body.status && { status: body.status }),
      ...(body.bulanPembayaran && { bulanPembayaran: body.bulanPembayaran }),
      ...(body.keterangan !== undefined && { keterangan: body.keterangan }),
      ...(body.buktiUrl !== undefined && { buktiUrl: body.buktiUrl }),
    }

    // Update pembayaran
    const updated = await prisma.pembayaran.update({
      where: { id },
      data: updateData,
      include: {
        penyewa: {
          select: {
            id: true,
            nama: true,
            email: true,
            noHp: true,
          }
        },
        kamar: {
          select: {
            id: true,
            nomorKamar: true,
            tipe: true,
            lantai: true,
            harga: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pembayaran updated successfully',
      data: updated
    })

  } catch (error) {
    console.error('PUT /api/pembayaran/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/pembayaran/[id] - Delete pembayaran
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if pembayaran exists
    const existing = await prisma.pembayaran.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Pembayaran not found' },
        { status: 404 }
      )
    }

    // Delete pembayaran
    await prisma.pembayaran.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Pembayaran deleted successfully'
    })

  } catch (error) {
    console.error('DELETE /api/pembayaran/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
