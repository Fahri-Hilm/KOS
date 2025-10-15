'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiHome } from 'react-icons/fi'
import { Kamar } from '@/types'
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function KamarPage() {
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [tipeFilter, setTipeFilter] = useState<string>('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchKamar()
  }, [search, statusFilter, tipeFilter])

  const fetchKamar = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (tipeFilter !== 'ALL') params.append('tipe', tipeFilter)

      const response = await fetch(`/api/kamar?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch kamar')
      
      const result = await response.json()
      
      // Handle paginated response format: { data: { items: [...], pagination: {...} } }
      if (result.data?.items && Array.isArray(result.data.items)) {
        setKamarList(result.data.items)
      } else if (Array.isArray(result.data)) {
        setKamarList(result.data)
      } else if (Array.isArray(result)) {
        setKamarList(result)
      } else {
        console.error('API returned non-array data:', result)
        setKamarList([])
        setError('Format data tidak valid')
      }
    } catch (err) {
      setError('Gagal memuat data kamar')
      console.error(err)
      setKamarList([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) return

    try {
      const response = await fetch(`/api/kamar/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete kamar')
      
      fetchKamar()
    } catch (err) {
      alert('Gagal menghapus kamar')
      console.error(err)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Kamar</h1>
            <p className="text-gray-600 mt-1">
              Kelola data kamar kos
            </p>
          </div>
          <Link href="/dashboard/kamar/add">
            <Button>
              <FiPlus className="inline mr-2" />
              Tambah Kamar
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari nomor atau tipe kamar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Status</option>
                <option value="TERSEDIA">Tersedia</option>
                <option value="TERISI">Terisi</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="BOOKING">Booking</option>
              </select>

              <select
                value={tipeFilter}
                onChange={(e) => setTipeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="STANDARD">Standard</option>
                <option value="DELUXE">Deluxe</option>
                <option value="VIP">VIP</option>
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

        {/* Kamar List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Daftar Kamar ({kamarList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-gray-600 mt-4">Memuat data...</p>
              </div>
            ) : kamarList.length === 0 ? (
              <div className="text-center py-12">
                <FiHome className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada kamar</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mulai dengan menambahkan kamar baru.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/kamar/add">
                    <Button>
                      <FiPlus className="inline mr-2" />
                      Tambah Kamar
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
                        No. Kamar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga/Bulan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penyewa
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(kamarList) && kamarList.map((kamar) => (
                      <tr key={kamar.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FiHome className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {kamar.nomorKamar}
                              </div>
                              <div className="text-sm text-gray-500">
                                {typeof kamar.fasilitas === 'string' 
                                  ? kamar.fasilitas.split(',').slice(0, 2).join(', ')
                                  : kamar.fasilitas.slice(0, 2).join(', ')
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {kamar.tipe}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(kamar.harga)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kamar.status)}`}>
                            {getStatusLabel(kamar.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {kamar.penyewa?.nama || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/kamar/${kamar.id}`}>
                              <Button
                                variant="secondary"
                                size="sm"
                              >
                                <FiEdit2 className="inline mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(kamar.id)}
                            >
                              <FiTrash2 className="inline mr-1" />
                              Hapus
                            </Button>
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
