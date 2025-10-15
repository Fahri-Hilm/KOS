'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  FiArrowLeft, FiEdit, FiTrash2, FiUser, FiMail, FiPhone, 
  FiHome, FiCalendar, FiCheckCircle, FiAlertCircle, FiDollarSign 
} from 'react-icons/fi'
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function DetailPenyewaPage() {
  const params = useParams()
  const router = useRouter()
  const penyewaId = params?.id as string

  const [penyewa, setPenyewa] = useState<any>(null)
  const [pembayaranList, setPembayaranList] = useState<any[]>([])
  const [pengaduanList, setPengaduanList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (penyewaId) {
      fetchPenyewaDetail()
    }
  }, [penyewaId])

  const fetchPenyewaDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/penyewa/${penyewaId}`)
      
      if (!response.ok) throw new Error('Failed to fetch penyewa')
      
      const result = await response.json()
      const penyewaData = result.data
      
      // Get first kamar if exists (relation is array)
      if (penyewaData.kamar && Array.isArray(penyewaData.kamar) && penyewaData.kamar.length > 0) {
        penyewaData.kamar = penyewaData.kamar[0]
      } else {
        penyewaData.kamar = null
      }
      
      setPenyewa(penyewaData)
      
      // Get pembayaran and pengaduan from included data
      if (penyewaData.pembayaran) {
        setPembayaranList(Array.isArray(penyewaData.pembayaran) ? penyewaData.pembayaran : [])
      }
      if (penyewaData.pengaduan) {
        setPengaduanList(Array.isArray(penyewaData.pengaduan) ? penyewaData.pengaduan : [])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Gagal memuat data penyewa')
    } finally {
      setLoading(false)
    }
  }

  const fetchPembayaran = async () => {
    // Skip - already included in detail API
  }

  const fetchPengaduan = async () => {
    // Skip - already included in detail API
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus penyewa ini? Data terkait (pembayaran, pengaduan) juga akan terhapus.')) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/penyewa/${penyewaId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete penyewa')
      }

      alert('Penyewa berhasil dihapus')
      router.push('/dashboard/penyewa')
    } catch (error: any) {
      console.error('Delete error:', error)
      alert(error.message || 'Gagal menghapus penyewa')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !penyewa) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error || 'Penyewa tidak ditemukan'}</div>
            <Link href="/dashboard/penyewa">
              <Button variant="primary">Kembali ke Daftar Penyewa</Button>
            </Link>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-800">Detail Penyewa</h1>
            <p className="text-gray-600 mt-1">
              Informasi lengkap penyewa
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/penyewa">
              <Button variant="secondary">
                <FiArrowLeft className="inline mr-2" />
                Kembali
              </Button>
            </Link>
            <Link href={`/dashboard/penyewa/${penyewaId}/edit`}>
              <Button variant="primary">
                <FiEdit className="inline mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              <FiTrash2 className="inline mr-2" />
              Hapus
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Penyewa Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <FiUser className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {penyewa.nama}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {penyewa.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiPhone className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">No. HP</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {penyewa.noHp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Tanggal Masuk</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {formatDate(penyewa.tanggalMasuk, 'dd MMMM yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiHome className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Kamar</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {penyewa.kamar?.nomorKamar || 'Belum ada kamar'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-1 ${getStatusColor(penyewa.status)}`}>
                        {getStatusLabel(penyewa.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {penyewa.alamat && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-2">Alamat Asal</p>
                    <p className="text-gray-900">
                      {penyewa.alamatAsal || penyewa.alamat}
                    </p>
                  </div>
                )}

                {penyewa.fotoKtpUrl && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-3">Foto KTP</p>
                    <a
                      href={penyewa.fotoKtpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={penyewa.fotoKtpUrl}
                        alt="KTP"
                        className="max-w-md w-full h-auto rounded-lg border hover:opacity-90 transition-opacity"
                      />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Pembayaran */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Riwayat Pembayaran Terbaru</CardTitle>
                  <Link href={`/dashboard/pembayaran?penyewaId=${penyewaId}`}>
                    <Button variant="secondary" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pembayaranList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada riwayat pembayaran
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pembayaranList.slice(0, 5).map((pembayaran) => (
                      <Link
                        key={pembayaran.id}
                        href={`/dashboard/pembayaran/${pembayaran.id}`}
                        className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(pembayaran.tanggalBayar, 'dd MMM yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {pembayaran.keterangan || 'Pembayaran Kos'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {formatCurrency(pembayaran.jumlah)}
                            </p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(pembayaran.status)}`}>
                              {getStatusLabel(pembayaran.status)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Pengaduan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pengaduan Terbaru</CardTitle>
                  <Link href={`/dashboard/pengaduan?penyewaId=${penyewaId}`}>
                    <Button variant="secondary" size="sm">
                      Lihat Semua
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pengaduanList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada pengaduan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pengaduanList.slice(0, 5).map((pengaduan) => (
                      <Link
                        key={pengaduan.id}
                        href={`/dashboard/pengaduan/${pengaduan.id}`}
                        className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {pengaduan.judul}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {pengaduan.deskripsi}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(pengaduan.createdAt, 'dd MMM yyyy')}
                            </p>
                          </div>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(pengaduan.status)}`}>
                            {getStatusLabel(pengaduan.status)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pembayaran</p>
                      <p className="font-bold text-gray-900">
                        {pembayaranList.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FiAlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pengaduan</p>
                      <p className="font-bold text-gray-900">
                        {pengaduanList.length}
                      </p>
                    </div>
                  </div>
                </div>

                {penyewa.kamar && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FiHome className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Harga Kamar</p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(penyewa.kamar.hargaPerBulan)}/bulan
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kamar Info */}
            {penyewa.kamar && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kamar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">No. Kamar</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {penyewa.kamar.nomorKamar}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Tipe</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {penyewa.kamar.tipe}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Harga</p>
                    <p className="font-semibold text-green-600 mt-1">
                      {formatCurrency(penyewa.kamar.hargaPerBulan)}/bulan
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Lantai</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      Lantai {penyewa.kamar.lantai}
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <Link href={`/dashboard/kamar/${penyewa.kamar.id}`}>
                      <Button variant="secondary" className="w-full">
                        Lihat Detail Kamar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Terdaftar</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(penyewa.createdAt, 'dd MMM yyyy HH:mm')}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Tanggal Masuk</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(penyewa.tanggalMasuk, 'dd MMM yyyy')}
                  </p>
                </div>

                {penyewa.updatedAt !== penyewa.createdAt && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Terakhir Update</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(penyewa.updatedAt, 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
