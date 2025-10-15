'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiArrowLeft, FiCheckCircle, FiClock, FiUser, FiCalendar } from 'react-icons/fi'
import { Pengaduan } from '@/types'
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel, getPriorityColor, formatCurrency } from '@/lib/utils'

export default function DetailPengaduanPage() {
  const params = useParams()
  const router = useRouter()
  const pengaduanId = params?.id as string

  const [pengaduan, setPengaduan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const [updateForm, setUpdateForm] = useState({
    status: '',
    tanggapan: '',
    biayaPerbaikan: '',
  })

  useEffect(() => {
    if (pengaduanId) {
      fetchPengaduanDetail()
    }
  }, [pengaduanId])

  const fetchPengaduanDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pengaduan/${pengaduanId}`)
      
      if (!response.ok) throw new Error('Failed to fetch pengaduan')
      
      const result = await response.json()
      setPengaduan(result.data)
      setUpdateForm({
        status: result.data.status,
        tanggapan: result.data.tanggapan || '',
        biayaPerbaikan: result.data.biayaPerbaikan?.toString() || '',
      })
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Gagal memuat data pengaduan')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setUpdating(true)

      const submitData: any = {
        status: updateForm.status,
      }

      if (updateForm.tanggapan.trim()) {
        submitData.tanggapan = updateForm.tanggapan.trim()
      }

      if (updateForm.biayaPerbaikan) {
        submitData.biayaPerbaikan = parseFloat(updateForm.biayaPerbaikan)
      }

      if (updateForm.status === 'SELESAI') {
        submitData.diselesaikanPada = new Date().toISOString()
      }

      const response = await fetch(`/api/pengaduan/${pengaduanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update pengaduan')
      }

      // Refresh data
      await fetchPengaduanDetail()
      alert('Status pengaduan berhasil diupdate')
    } catch (error: any) {
      console.error('Update error:', error)
      alert(error.message || 'Gagal mengupdate pengaduan')
    } finally {
      setUpdating(false)
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

  if (error || !pengaduan) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error || 'Pengaduan tidak ditemukan'}</div>
            <Link href="/dashboard/pengaduan">
              <Button variant="primary">Kembali ke Daftar Pengaduan</Button>
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
            <h1 className="text-3xl font-bold text-gray-800">Detail Pengaduan</h1>
            <p className="text-gray-600 mt-1">
              {pengaduan.judul}
            </p>
          </div>
          <Link href="/dashboard/pengaduan">
            <Button variant="secondary">
              <FiArrowLeft className="inline mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pengaduan Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Informasi Pengaduan</CardTitle>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(pengaduan.status)}`}>
                      {getStatusLabel(pengaduan.status)}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(pengaduan.prioritas)}`}>
                      {pengaduan.prioritas}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pengaduan.judul}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Kategori: {pengaduan.kategori.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Deskripsi:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {pengaduan.deskripsi}
                    </p>
                  </div>

                  {/* Photos */}
                  {Array.isArray(pengaduan.fotoUrl) && pengaduan.fotoUrl.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-3">Foto Pengaduan:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {pengaduan.fotoUrl.map((url: string, index: number) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  {pengaduan.tanggapan && (
                    <div className="pt-4 border-t bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Tanggapan:</h4>
                      <p className="text-blue-800 whitespace-pre-wrap">
                        {pengaduan.tanggapan}
                      </p>
                    </div>
                  )}

                  {/* Cost */}
                  {pengaduan.biayaPerbaikan && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900">Biaya Perbaikan:</h4>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {formatCurrency(pengaduan.biayaPerbaikan)}
                      </p>
                    </div>
                  )}

                  {/* Completion Date */}
                  {pengaduan.diselesaikanPada && (
                    <div className="pt-4 border-t flex items-center gap-2 text-green-600">
                      <FiCheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Diselesaikan pada {formatDate(pengaduan.diselesaikanPada, 'dd MMMM yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Update Status Form */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status Pengaduan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="BARU">Baru</option>
                      <option value="DIPROSES">Diproses</option>
                      <option value="SELESAI">Selesai</option>
                      <option value="DITOLAK">Ditolak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggapan
                    </label>
                    <textarea
                      value={updateForm.tanggapan}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, tanggapan: e.target.value }))}
                      rows={4}
                      placeholder="Berikan tanggapan atau update progress..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Input
                    label="Biaya Perbaikan (Rp)"
                    type="number"
                    value={updateForm.biayaPerbaikan}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, biayaPerbaikan: e.target.value }))}
                    placeholder="Masukkan biaya jika ada"
                    min="0"
                  />

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      type="submit"
                      loading={updating}
                      disabled={updating}
                    >
                      <FiCheckCircle className="inline mr-2" />
                      Update Status
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Penyewa Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Penyewa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-medium text-gray-900">
                        {pengaduan.penyewa?.nama || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {pengaduan.penyewa?.email || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiClock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">No. HP</p>
                      <p className="font-medium text-gray-900">
                        {pengaduan.penyewa?.noHp || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Dibuat</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(pengaduan.createdAt, 'dd MMM yyyy HH:mm')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(pengaduan.createdAt)}
                    </p>
                  </div>

                  {pengaduan.updatedAt !== pengaduan.createdAt && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">Terakhir Diupdate</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(pengaduan.updatedAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(pengaduan.updatedAt)}
                      </p>
                    </div>
                  )}

                  {pengaduan.diselesaikanPada && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">Diselesaikan</p>
                      <p className="font-medium text-green-600">
                        {formatDate(pengaduan.diselesaikanPada, 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
