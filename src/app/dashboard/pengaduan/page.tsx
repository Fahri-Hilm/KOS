'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiPlus, FiSearch, FiEye, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi'
import { Pengaduan } from '@/types'
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel, getPriorityColor } from '@/lib/utils'

export default function PengaduanPage() {
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL')
  const [prioritasFilter, setPrioritasFilter] = useState<string>('ALL')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPengaduan()
  }, [search, statusFilter, kategoriFilter, prioritasFilter])

  const fetchPengaduan = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (kategoriFilter !== 'ALL') params.append('kategori', kategoriFilter)
      if (prioritasFilter !== 'ALL') params.append('prioritas', prioritasFilter)

      const response = await fetch(`/api/pengaduan?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch pengaduan')
      
      const result = await response.json()
      
      // Handle paginated response
      if (result.data?.items && Array.isArray(result.data.items)) {
        setPengaduanList(result.data.items)
      } else if (Array.isArray(result.data)) {
        setPengaduanList(result.data)
      } else if (Array.isArray(result)) {
        setPengaduanList(result)
      } else {
        console.error('API returned non-array data:', result)
        setPengaduanList([])
        setError('Format data tidak valid')
      }
    } catch (err) {
      setError('Gagal memuat data pengaduan')
      console.error(err)
      setPengaduanList([])
    } finally {
      setLoading(false)
    }
  }

  const getBaruCount = () => pengaduanList.filter(p => p.status === 'BARU').length
  const getDiprosesCount = () => pengaduanList.filter(p => p.status === 'DIPROSES').length
  const getSelesaiCount = () => pengaduanList.filter(p => p.status === 'SELESAI').length

  const getPriorityIcon = (prioritas: string) => {
    switch (prioritas) {
      case 'DARURAT': return <FiAlertCircle className="w-4 h-4" />
      case 'TINGGI': return <FiAlertCircle className="w-4 h-4" />
      default: return <FiClock className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengaduan</h1>
            <p className="text-gray-600 mt-1">
              Kelola pengaduan dan maintenance request
            </p>
          </div>
          <Link href="/dashboard/pengaduan/add">
            <Button>
              <FiPlus className="inline mr-2" />
              Tambah Pengaduan
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pengaduan Baru</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {getBaruCount()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiAlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sedang Diproses</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {getDiprosesCount()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {getSelesaiCount()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari judul atau deskripsi..."
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
                <option value="BARU">Baru</option>
                <option value="DIPROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
                <option value="DITOLAK">Ditolak</option>
              </select>

              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="LISTRIK">Listrik</option>
                <option value="AIR">Air</option>
                <option value="KAMAR_MANDI">Kamar Mandi</option>
                <option value="FURNITURE">Furniture</option>
                <option value="AC">AC</option>
                <option value="KEBERSIHAN">Kebersihan</option>
                <option value="KEAMANAN">Keamanan</option>
                <option value="LAINNYA">Lainnya</option>
              </select>

              <select
                value={prioritasFilter}
                onChange={(e) => setPrioritasFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="RENDAH">Rendah</option>
                <option value="SEDANG">Sedang</option>
                <option value="TINGGI">Tinggi</option>
                <option value="DARURAT">Darurat</option>
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

        {/* Pengaduan List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        ) : pengaduanList.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengaduan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Belum ada pengaduan yang dicatat.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/pengaduan/add">
                    <Button>
                      <FiPlus className="inline mr-2" />
                      Tambah Pengaduan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(pengaduanList) && pengaduanList.map((pengaduan) => (
              <Card key={pengaduan.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {pengaduan.judul}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {(pengaduan as any).penyewa?.nama || 'Unknown'}
                        </p>
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(pengaduan.prioritas)}`}>
                        {pengaduan.prioritas}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {pengaduan.deskripsi}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pengaduan.status)}`}>
                        {getStatusLabel(pengaduan.status)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {pengaduan.kategori.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Foto Preview */}
                    {Array.isArray(pengaduan.fotoUrl) && pengaduan.fotoUrl.length > 0 && (
                      <div className="flex gap-2">
                        {pengaduan.fotoUrl.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                        {pengaduan.fotoUrl.length > 3 && (
                          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border text-sm text-gray-600">
                            +{pengaduan.fotoUrl.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(pengaduan.createdAt)}
                      </span>
                      <Link href={`/dashboard/pengaduan/${pengaduan.id}`}>
                        <Button variant="secondary" size="sm">
                          <FiEye className="inline mr-1" />
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

