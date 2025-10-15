import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FiUsers, FiGrid, FiDollarSign, FiAlertCircle } from 'react-icons/fi'
import prisma from '@/lib/prisma'

async function getDashboardStats() {
  const [
    totalPenyewa,
    totalKamar,
    kamarTersedia,
    totalPembayaranBulanIni,
    pengaduanBaru,
  ] = await Promise.all([
    prisma.penyewa.count({ where: { status: 'AKTIF' } }),
    prisma.kamar.count(),
    prisma.kamar.count({ where: { status: 'TERSEDIA' } }),
    prisma.pembayaran.count({
      where: {
        bulanPembayaran: new Date().toISOString().slice(0, 7),
        status: 'LUNAS',
      },
    }),
    prisma.pengaduan.count({ where: { status: 'BARU' } }),
  ])

  return {
    totalPenyewa,
    totalKamar,
    kamarTersedia,
    totalPembayaranBulanIni,
    pengaduanBaru,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Penyewa',
      value: stats.totalPenyewa,
      icon: FiUsers,
      color: 'blue',
    },
    {
      title: 'Kamar Tersedia',
      value: `${stats.kamarTersedia}/${stats.totalKamar}`,
      icon: FiGrid,
      color: 'green',
    },
    {
      title: 'Pembayaran Bulan Ini',
      value: stats.totalPembayaranBulanIni,
      icon: FiDollarSign,
      color: 'yellow',
    },
    {
      title: 'Pengaduan Baru',
      value: stats.pengaduanBaru,
      icon: FiAlertCircle,
      color: 'red',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang di sistem manajemen kos-kosan
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              red: 'bg-red-100 text-red-600',
            }

            return (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-full ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboard/penyewa?action=add"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <FiUsers className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-700">Tambah Penyewa</p>
              </a>
              <a
                href="/dashboard/kamar?action=add"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
              >
                <FiGrid className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-700">Tambah Kamar</p>
              </a>
              <a
                href="/dashboard/pembayaran?action=add"
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
              >
                <FiDollarSign className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-700">Input Pembayaran</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
