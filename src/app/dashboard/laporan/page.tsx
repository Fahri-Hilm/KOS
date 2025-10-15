'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { FiDollarSign, FiHome, FiUsers, FiAlertCircle, FiDownload, FiCalendar } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function LaporanPage() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    months: 6,
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/laporan?months=${dateRange.months}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const text = await response.text()
        console.error('API Error Response Text:', text)
        
        let errorData
        try {
          errorData = JSON.parse(text)
        } catch {
          errorData = { error: text || 'Unknown error' }
        }
        
        console.error('API Error:', errorData)
        throw new Error(`Failed to fetch report: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      console.log('API Result:', result)
      setReportData(result.data)
    } catch (error) {
      console.error('Fetch error:', error)
      alert('Gagal memuat data laporan. Silakan refresh halaman.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Fitur export akan segera tersedia!')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Memuat laporan...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Gagal memuat data laporan</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laporan & Analytics</h1>
            <p className="text-gray-600 mt-1">
              Periode: {reportData.dateRange.start} s/d {reportData.dateRange.end}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange.months}
              onChange={(e) => setDateRange({ months: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="3">3 Bulan Terakhir</option>
              <option value="6">6 Bulan Terakhir</option>
              <option value="12">12 Bulan Terakhir</option>
            </select>
            <Button onClick={handleExport} variant="secondary">
              <FiDownload className="inline mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(reportData.revenue.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reportData.revenue.transactionCount} transaksi
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tingkat Hunian</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.occupancy.rate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reportData.occupancy.occupied}/{reportData.occupancy.total} kamar
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiHome className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Penyewa Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.tenants.active}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    dari {reportData.tenants.total} total
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pengaduan</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {reportData.complaints.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    periode ini
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FiAlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tren Pendapatan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.revenue.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Pendapatan"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occupancy Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Kamar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Terisi', value: reportData.occupancy.occupied },
                      { name: 'Tersedia', value: reportData.occupancy.available },
                      { name: 'Perawatan', value: reportData.occupancy.maintenance },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Terisi', value: reportData.occupancy.occupied },
                      { name: 'Tersedia', value: reportData.occupancy.available },
                      { name: 'Perawatan', value: reportData.occupancy.maintenance },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.payments.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" fill="#10B981" name="Total Nilai" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Complaint Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori Pengaduan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.complaints.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" name="Jumlah" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Details Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Types */}
          <Card>
            <CardHeader>
              <CardTitle>Tipe Kamar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.rooms.byType.map((room: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{room.type}</p>
                      <p className="text-sm text-gray-600">
                        {room.count} kamar
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(room.averagePrice)}
                      </p>
                      <p className="text-xs text-gray-500">rata-rata/bulan</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tren 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pembayaran Baru</p>
                      <p className="text-sm text-gray-600">7 hari terakhir</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.trends.last7Days.payments}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FiUsers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Penyewa Baru</p>
                      <p className="text-sm text-gray-600">7 hari terakhir</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.trends.last7Days.newTenants}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <FiAlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pengaduan Baru</p>
                      <p className="text-sm text-gray-600">7 hari terakhir</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {reportData.trends.last7Days.complaints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Payments Alert */}
        {reportData.payments.outstanding.count > 0 && (
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiAlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Pembayaran Tertunggak
                  </p>
                  <p className="text-sm text-gray-600">
                    {reportData.payments.outstanding.count} pembayaran dengan total{' '}
                    <span className="font-semibold text-red-600">
                      {formatCurrency(reportData.payments.outstanding.amount)}
                    </span>
                  </p>
                </div>
              </div>
              <Button variant="danger" onClick={() => window.location.href = '/dashboard/pembayaran'}>
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
