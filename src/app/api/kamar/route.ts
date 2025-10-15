import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseBody,
  validateRequiredFields,
  getPaginationParams,
  paginatedResponse,
} from '@/lib/api'

// GET - Get all kamar with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit, page } = getPaginationParams(request)
    const status = searchParams.get('status')
    const tipe = searchParams.get('tipe')
    const lantai = searchParams.get('lantai')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (tipe) {
      where.tipe = tipe
    }

    if (lantai) {
      where.lantai = parseInt(lantai)
    }

    const [kamar, total] = await Promise.all([
      prisma.kamar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nomorKamar: 'asc' },
        include: {
          penyewa: {
            select: {
              id: true,
              nama: true,
              email: true,
              noHp: true,
            },
          },
          _count: {
            select: {
              pembayaran: true,
              perawatan: true,
            },
          },
        },
      }),
      prisma.kamar.count({ where }),
    ])

    return paginatedResponse(kamar, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Create new kamar
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request)

    const validation = validateRequiredFields(body, [
      'nomorKamar',
      'lantai',
      'tipe',
      'hargaPerBulan',
    ])

    if (!validation.valid) {
      return errorResponse('Validation failed', 'Invalid input', 400, validation.errors)
    }

    const kamar = await prisma.kamar.create({
      data: {
        nomorKamar: body.nomorKamar,
        lantai: parseInt(body.lantai),
        tipe: body.tipe,
        hargaPerBulan: parseFloat(body.hargaPerBulan),
        fasilitas: body.fasilitas || [],
        status: body.status || 'TERSEDIA',
        kapasitas: body.kapasitas || 1,
        luasKamar: body.luasKamar ? parseFloat(body.luasKamar) : null,
        deskripsi: body.deskripsi,
        fotoUrl: body.fotoUrl || [],
      },
    })

    return successResponse('Kamar created successfully', kamar, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
