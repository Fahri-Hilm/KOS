import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { auth } from '@/auth'

// GET /api/laporan - Get comprehensive reports and statistics
export async function GET(request: NextRequest) {
  try {
    console.log('=== API Laporan Called ===')
    
    // Check authentication
    const session = await auth()
    if (!session) {
      console.log('No session found - Unauthorized')
      return errorResponse('Unauthorized', 'Please login to access this resource', 401)
    }
    
    console.log('Session found:', session.user?.email)
    
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const months = parseInt(searchParams.get('months') || '6')

    console.log('Params:', { startDate, endDate, months })

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : subMonths(end, months)

    console.log('Date range:', { start, end })

    // === Revenue Statistics ===
    console.log('Fetching revenue data...')
    const revenueData = await prisma.pembayaran.groupBy({
      by: ['bulanPembayaran'],
      where: {
        tanggalBayar: {
          gte: start,
          lte: end,
        },
        status: 'LUNAS',
      },
      _sum: {
        jumlah: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        bulanPembayaran: 'asc',
      },
    })

    const monthlyRevenue = revenueData.map((item: any) => ({
      month: format(new Date(item.bulanPembayaran), 'MMM yyyy'),
      revenue: item._sum.jumlah || 0,
      count: item._count.id,
    }))

    const totalRevenue = await prisma.pembayaran.aggregate({
      where: {
        tanggalBayar: {
          gte: start,
          lte: end,
        },
        status: 'LUNAS',
      },
      _sum: {
        jumlah: true,
      },
      _count: {
        id: true,
      },
    })

    console.log('Revenue data fetched:', revenueData.length, 'records')

    // === Occupancy Statistics ===
    console.log('Fetching occupancy data...')
    const totalKamar = await prisma.kamar.count()
    const kamarTerisi = await prisma.kamar.count({
      where: { status: 'TERISI' },
    })
    const kamarTersedia = await prisma.kamar.count({
      where: { status: 'TERSEDIA' },
    })
    const kamarMaintenance = await prisma.kamar.count({
      where: { status: 'MAINTENANCE' },
    })

    console.log('Occupancy data fetched:', { totalKamar, kamarTerisi, kamarTersedia, kamarMaintenance })

    const occupancyRate = totalKamar > 0 ? (kamarTerisi / totalKamar) * 100 : 0

    console.log('Occupancy rate:', occupancyRate)

    // === Payment Status Breakdown ===
    console.log('Fetching payment status...')
    const paymentStatusCounts = await prisma.pembayaran.groupBy({
      by: ['status'],
      where: {
        tanggalBayar: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        jumlah: true,
      },
    })

    const paymentStatus = paymentStatusCounts.map((item: any) => ({
      status: item.status,
      count: item._count.id,
      total: item._sum.jumlah || 0,
    }))

    // === Complaint Statistics ===
    const complaintStatusCounts = await prisma.pengaduan.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    })

    const complaintStatus = complaintStatusCounts.map((item: any) => ({
      status: item.status,
      count: item._count.id,
    }))

    const complaintByCategory = await prisma.pengaduan.groupBy({
      by: ['kategori'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })

    const complaintCategories = complaintByCategory.map((item: any) => ({
      category: item.kategori,
      count: item._count.id,
    }))

    // === Tenant Statistics ===
    const penyewaAktif = await prisma.penyewa.count({
      where: { status: 'AKTIF' },
    })
    const penyewaKeluar = await prisma.penyewa.count({
      where: { status: 'KELUAR' },
    })
    const penyewaSuspend = await prisma.penyewa.count({
      where: { status: 'SUSPEND' },
    })

    // === Room Type Distribution ===
    const roomsByType = await prisma.kamar.groupBy({
      by: ['tipe'],
      _count: {
        id: true,
      },
      _avg: {
        hargaPerBulan: true,
      },
    })

    const roomTypes = roomsByType.map((item: any) => ({
      type: item.tipe,
      count: item._count.id,
      averagePrice: item._avg.hargaPerBulan || 0,
    }))

    // === Outstanding Payments ===
    const outstandingPayments = await prisma.pembayaran.aggregate({
      where: {
        status: {
          in: ['PENDING', 'TELAT'],
        },
      },
      _sum: {
        jumlah: true,
      },
      _count: {
        id: true,
      },
    })

    // === Recent Trends (Last 7 Days) ===
    const last7Days = subMonths(new Date(), 0)
    last7Days.setDate(last7Days.getDate() - 7)

    const recentPayments = await prisma.pembayaran.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    })

    const recentComplaints = await prisma.pengaduan.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    })

    const recentTenants = await prisma.penyewa.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    })

    // === Compile Response ===
    const report = {
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue._sum.jumlah || 0,
        transactionCount: totalRevenue._count.id || 0,
        average: totalRevenue._count.id
          ? (Number(totalRevenue._sum.jumlah) || 0) / Number(totalRevenue._count.id)
          : 0,
      },
      occupancy: {
        total: totalKamar,
        occupied: kamarTerisi,
        available: kamarTersedia,
        maintenance: kamarMaintenance,
        rate: parseFloat(occupancyRate.toFixed(2)),
      },
      payments: {
        byStatus: paymentStatus,
        outstanding: {
          amount: outstandingPayments._sum.jumlah || 0,
          count: outstandingPayments._count.id || 0,
        },
      },
      complaints: {
        byStatus: complaintStatus,
        byCategory: complaintCategories,
        total: complaintStatusCounts.reduce(
          (sum: number, item: any) => sum + item._count.id,
          0
        ),
      },
      tenants: {
        active: penyewaAktif,
        left: penyewaKeluar,
        suspended: penyewaSuspend,
        total: penyewaAktif + penyewaKeluar + penyewaSuspend,
      },
      rooms: {
        byType: roomTypes,
      },
      trends: {
        last7Days: {
          payments: recentPayments,
          complaints: recentComplaints,
          newTenants: recentTenants,
        },
      },
      dateRange: {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
      },
    }

    console.log('Report object created successfully')
    console.log('Report keys:', Object.keys(report))

    console.log('Returning success response...')
    
    return successResponse('Laporan berhasil dimuat', report)
  } catch (error: any) {
    console.error('Get laporan error:', error)
    console.error('Error stack:', error?.stack)
    console.error('Error message:', error?.message)
    
    return errorResponse('Failed to fetch laporan', error?.message || 'Unknown error', 500)
  }
}
