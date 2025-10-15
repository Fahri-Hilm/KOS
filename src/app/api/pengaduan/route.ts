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

// GET - Get all pengaduan with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit, page } = getPaginationParams(request)
    const status = searchParams.get('status')
    const penyewaId = searchParams.get('penyewaId')
    const kategori = searchParams.get('kategori')
    const prioritas = searchParams.get('prioritas')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (penyewaId) {
      where.penyewaId = penyewaId
    }

    if (kategori) {
      where.kategori = kategori
    }

    if (prioritas) {
      where.prioritas = prioritas
    }

    const [pengaduan, total] = await Promise.all([
      prisma.pengaduan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.pengaduan.count({ where }),
    ])

    return paginatedResponse(pengaduan, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Create new pengaduan
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request)

    const validation = validateRequiredFields(body, [
      'penyewaId',
      'judul',
      'deskripsi',
      'kategori',
    ])

    if (!validation.valid) {
      return errorResponse('Validation failed', 'Invalid input', 400, validation.errors)
    }

    const pengaduan = await prisma.pengaduan.create({
      data: {
        penyewaId: body.penyewaId,
        judul: body.judul,
        deskripsi: body.deskripsi,
        kategori: body.kategori,
        prioritas: body.prioritas || 'SEDANG',
        status: 'BARU',
        fotoUrl: body.fotoUrl || [],
      },
      include: {
        penyewa: true,
      },
    })

    return successResponse('Pengaduan created successfully', pengaduan, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
