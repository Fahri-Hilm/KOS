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

// GET - Get all pembayaran with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { skip, limit, page } = getPaginationParams(request)
    const status = searchParams.get('status')
    const penyewaId = searchParams.get('penyewaId')
    const kamarId = searchParams.get('kamarId')
    const bulan = searchParams.get('bulan')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (penyewaId) {
      where.penyewaId = penyewaId
    }

    if (kamarId) {
      where.kamarId = kamarId
    }

    if (bulan) {
      where.bulanPembayaran = bulan
    }

    const [pembayaran, total] = await Promise.all([
      prisma.pembayaran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalBayar: 'desc' },
        include: {
          penyewa: {
            select: {
              id: true,
              nama: true,
              email: true,
              noHp: true,
            },
          },
          kamar: {
            select: {
              id: true,
              nomorKamar: true,
              tipe: true,
            },
          },
        },
      }),
      prisma.pembayaran.count({ where }),
    ])

    return paginatedResponse(pembayaran, total, page, limit)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Create new pembayaran
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request)

    const validation = validateRequiredFields(body, [
      'penyewaId',
      'kamarId',
      'bulanPembayaran',
      'jumlah',
      'metodePembayaran',
      'jatuhTempo',
    ])

    if (!validation.valid) {
      return errorResponse('Validation failed', 'Invalid input', 400, validation.errors)
    }

    // Generate invoice number
    const lastInvoice = await prisma.pembayaran.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { nomorInvoice: true },
    })

    let invoiceNumber = 'INV-001'
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.nomorInvoice.split('-')[1])
      invoiceNumber = `INV-${String(lastNumber + 1).padStart(3, '0')}`
    }

    const pembayaran = await prisma.pembayaran.create({
      data: {
        nomorInvoice: invoiceNumber,
        penyewaId: body.penyewaId,
        kamarId: body.kamarId,
        bulanPembayaran: body.bulanPembayaran,
        jumlah: parseFloat(body.jumlah),
        metodePembayaran: body.metodePembayaran,
        status: body.status || 'PENDING',
        keterangan: body.keterangan,
        buktiUrl: body.buktiUrl,
        jatuhTempo: new Date(body.jatuhTempo),
        tanggalBayar: body.tanggalBayar ? new Date(body.tanggalBayar) : new Date(),
      },
      include: {
        penyewa: true,
        kamar: true,
      },
    })

    return successResponse('Pembayaran created successfully', pembayaran, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
