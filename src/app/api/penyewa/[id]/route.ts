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

// GET - Get single penyewa by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const penyewa = await prisma.penyewa.findUnique({
      where: { id: params.id },
      include: {
        kamar: {
          select: {
            id: true,
            nomorKamar: true,
            lantai: true,
            tipe: true,
            hargaPerBulan: true,
            status: true,
          },
        },
        pembayaran: {
          orderBy: { tanggalBayar: 'desc' },
          take: 10,
        },
        pengaduan: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!penyewa) {
      return errorResponse('Penyewa not found', 'Invalid ID', 404)
    }

    return successResponse('Penyewa retrieved successfully', penyewa)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT - Update penyewa
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await parseBody(request)

    const penyewa = await prisma.penyewa.update({
      where: { id: params.id },
      data: {
        nama: body.nama,
        email: body.email,
        noHp: body.noHp,
        alamatAsal: body.alamatAsal,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
        pekerjaan: body.pekerjaan,
        fotoKtpUrl: body.fotoKtpUrl,
        ktpNumber: body.ktpNumber,
        status: body.status,
      },
    })

    return successResponse('Penyewa updated successfully', penyewa)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Delete penyewa
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.penyewa.delete({
      where: { id: params.id },
    })

    return successResponse('Penyewa deleted successfully', null, 200)
  } catch (error) {
    return handleApiError(error)
  }
}
