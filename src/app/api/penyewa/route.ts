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

// GET - Get all penyewa with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit, page } = getPaginationParams(request)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const where: any = {}

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { noHp: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter by status
    if (status) {
      where.status = status
    }

    const [penyewa, total] = await Promise.all([
      prisma.penyewa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          kamar: {
            select: {
              id: true,
              nomorKamar: true,
              tipe: true,
              hargaPerBulan: true,
            },
          },
          _count: {
            select: {
              pembayaran: true,
              pengaduan: true,
            },
          },
        },
      }),
      prisma.penyewa.count({ where }),
    ])

    return paginatedResponse(penyewa, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Create new penyewa
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request)

    const validation = validateRequiredFields(body, [
      'nama',
      'email',
      'noHp',
      'alamatAsal',
      'tanggalLahir',
    ])

    if (!validation.valid) {
      return errorResponse('Validation failed', 'Invalid input', 400, validation.errors)
    }

    const penyewa = await prisma.penyewa.create({
      data: {
        nama: body.nama,
        email: body.email,
        noHp: body.noHp,
        alamatAsal: body.alamatAsal,
        tanggalLahir: new Date(body.tanggalLahir),
        pekerjaan: body.pekerjaan,
        fotoKtpUrl: body.fotoKtpUrl,
        ktpNumber: body.ktpNumber,
        status: body.status || 'AKTIF',
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : new Date(),
      },
    })

    return successResponse('Penyewa created successfully', penyewa, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
