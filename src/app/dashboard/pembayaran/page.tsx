'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiPlus, FiSearch, FiEye, FiDollarSign, FiDownload } from 'react-icons/fi'
import { Pembayaran } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function PembayaranPage() {
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [monthFilter, setMonthFilter] = useState<string>('ALL')
  const [error, setError] = useState('')

  // Generate month options for filter
  const generateMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
      months.push({ value, label })
    }
    return months
  }

  const monthOptions = generateMonthOptions()

  useEffect(() => {
    fetchPembayaran()
  }, [search, statusFilter, monthFilter])

  const fetchPembayaran = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (monthFilter !== 'ALL') params.append('bulan', monthFilter)

      const response = await fetch(`/api/pembayaran?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch pembayaran')
      
      const result = await response.json()
      
      // Handle paginated response
      if (result.data?.items && Array.isArray(result.data.items)) {
        setPembayaranList(result.data.items)
      } else if (Array.isArray(result.data)) {
        setPembayaranList(result.data)
      } else if (Array.isArray(result)) {
        setPembayaranList(result)
      } else {
        console.error('API returned non-array data:', result)
        setPembayaranList([])
        setError('Format data tidak valid')
      }
    } catch (err) {
      setError('Gagal memuat data pembayaran')
      console.error(err)
      setPembayaranList([])
    } finally {
      setLoading(false)
    }
  }

  const getTotalPembayaran = () => {
    return pembayaranList.reduce((total, p) => {
      if (p.status === 'LUNAS') return total + p.jumlah
      return total
    }, 0)
  }

  const getPendingCount = () => {
    return pembayaranList.filter(p => p.status === 'PENDING').length
  }

  const getTelatCount = () => {
    return pembayaranList.filter(p => p.status === 'TELAT').length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pembayaran</h1>
            <p className="text-gray-600 mt-1">
              Kelola pembayaran dan invoice
            </p>
          </div>
          <Link href="/dashboard/pembayaran/add">
            <Button>
              <FiPlus className="inline mr-2" />
              Catat Pembayaran
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(getTotalPembayaran())}
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
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {getPendingCount()} Invoice
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {getTelatCount()} Invoice
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FiDollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari invoice atau nama penyewa..."
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="LUNAS">Lunas</option>
                <option value="TELAT">Terlambat</option>
                <option value="BATAL">Batal</option>
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Bulan</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pembayaran List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Daftar Pembayaran ({pembayaranList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600 mt-4">Memuat data...</p>
              </div>
            ) : pembayaranList.length === 0 ? (
              <div className="text-center py-12">
                <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pembayaran</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mulai dengan mencatat pembayaran baru.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/pembayaran/add">
                    <Button>
                      <FiPlus className="inline mr-2" />
                      Catat Pembayaran
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penyewa / Kamar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bulan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Bayar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(pembayaranList) && pembayaranList.map((pembayaran) => (
                      <tr key={pembayaran.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {pembayaran.nomorInvoice}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pembayaran.metodePembayaran}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {(pembayaran as any).penyewa?.nama || '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Kamar {(pembayaran as any).kamar?.nomorKamar || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pembayaran.bulanPembayaran}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(pembayaran.jumlah)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pembayaran.tanggalBayar, 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pembayaran.status)}`}>
                            {getStatusLabel(pembayaran.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/pembayaran/${pembayaran.id}`}>
                              <Button
                                variant="secondary"
                                size="sm"
                              >
                                <FiEye className="inline mr-1" />
                                Detail
                              </Button>
                            </Link>
                            <Link href={`/dashboard/pembayaran/${pembayaran.id}`}>
                              <Button
                                variant="success"
                                size="sm"
                              >
                                <FiDownload className="inline mr-1" />
                                Invoice
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

