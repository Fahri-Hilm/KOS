import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseBody,
} from '@/lib/api'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get single kamar by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const kamar = await prisma.kamar.findUnique({
      where: { id: params.id },
      include: {
        penyewa: true,
        pembayaran: {
          orderBy: { tanggalBayar: 'desc' },
          take: 10,
        },
        perawatan: {
          orderBy: { tanggalPerawatan: 'desc' },
          take: 10,
        },
      },
    })

    if (!kamar) {
      return errorResponse('Kamar not found', 'Invalid ID', 404)
    }

    return successResponse('Kamar retrieved successfully', kamar)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT - Update kamar
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await parseBody(request)

    const updateData: any = {
      nomorKamar: body.nomorKamar,
      lantai: body.lantai ? parseInt(body.lantai) : undefined,
      tipe: body.tipe,
      hargaPerBulan: body.hargaPerBulan ? parseFloat(body.hargaPerBulan) : undefined,
      fasilitas: body.fasilitas,
      status: body.status,
      kapasitas: body.kapasitas ? parseInt(body.kapasitas) : undefined,
      luasKamar: body.luasKamar ? parseFloat(body.luasKamar) : undefined,
      deskripsi: body.deskripsi,
      fotoUrl: body.fotoUrl,
    }

    // If assigning to a penyewa
    if (body.penyewaId) {
      updateData.penyewaId = body.penyewaId
    }

    const kamar = await prisma.kamar.update({
      where: { id: params.id },
      data: updateData,
    })

    return successResponse('Kamar updated successfully', kamar)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Delete kamar
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.kamar.delete({
      where: { id: params.id },
    })

    return successResponse('Kamar deleted successfully', null, 200)
  } catch (error) {
    return handleApiError(error)
  }
}
