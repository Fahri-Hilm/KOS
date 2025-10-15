import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api'

// GET /api/pengaduan/[id] - Get pengaduan detail
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { id: pengaduanId } = context.params;

    const pengaduan = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
      include: {
        penyewa: {
          select: {
            id: true,
            nama: true,
            email: true,
            noHp: true,
            status: true,
          },
        },
      },
    })

    if (!pengaduan) {
      return NextResponse.json(
        errorResponse('Pengaduan tidak ditemukan'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      successResponse('Pengaduan berhasil dimuat', pengaduan)
    )
  } catch (error) {
    console.error('Get pengaduan detail error:', error)
    return NextResponse.json(
      errorResponse('Failed to fetch pengaduan'),
      { status: 500 }
    )
  }
}

// PUT /api/pengaduan/[id] - Update pengaduan
export async function PUT(
  request: NextRequest,
  context: any
) {
  try {
    const pengaduanId = context.params.id;
    const body = await request.json()

    const { status, tanggapan, biayaPerbaikan, diselesaikanPada } = body

    // Validate status if provided
    const validStatuses = ['BARU', 'DIPROSES', 'SELESAI', 'DITOLAK']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        errorResponse('Status tidak valid'),
        { status: 400 }
      )
    }

    // Check if pengaduan exists
    const existingPengaduan = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
    })

    if (!existingPengaduan) {
      return NextResponse.json(
        errorResponse('Pengaduan tidak ditemukan'),
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (status) updateData.status = status
    if (tanggapan !== undefined) updateData.tanggapan = tanggapan
    if (biayaPerbaikan !== undefined) {
      updateData.biayaPerbaikan = parseFloat(biayaPerbaikan)
    }
    if (diselesaikanPada) {
      updateData.diselesaikanPada = new Date(diselesaikanPada)
    }

    // Update pengaduan
    const updatedPengaduan = await prisma.pengaduan.update({
      where: { id: pengaduanId },
      data: updateData,
      include: {
        penyewa: {
          select: {
            id: true,
            nama: true,
            email: true,
            noHp: true,
          },
        },
      },
    })

    return NextResponse.json(
      successResponse('Pengaduan berhasil diupdate', updatedPengaduan)
    )
  } catch (error) {
    console.error('Update pengaduan error:', error)
    return NextResponse.json(
      errorResponse('Failed to update pengaduan'),
      { status: 500 }
    )
  }
}

// DELETE /api/pengaduan/[id] - Delete pengaduan
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const pengaduanId = context.params.id;

    // Check if pengaduan exists
    const existingPengaduan = await prisma.pengaduan.findUnique({
      where: { id: pengaduanId },
    })

    if (!existingPengaduan) {
      return NextResponse.json(
        errorResponse('Pengaduan tidak ditemukan'),
        { status: 404 }
      )
    }

    // Delete pengaduan
    await prisma.pengaduan.delete({
      where: { id: pengaduanId },
    })

    return NextResponse.json(
      successResponse('Pengaduan berhasil dihapus')
    )
  } catch (error) {
    console.error('Delete pengaduan error:', error)
    return NextResponse.json(
      errorResponse('Failed to delete pengaduan'),
      { status: 500 }
    )
  }
}
