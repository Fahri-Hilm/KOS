'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { FiArrowLeft, FiSave } from 'react-icons/fi'

export default function EditPenyewaPage() {
  const params = useParams()
  const router = useRouter()
  const penyewaId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [kamarList, setKamarList] = useState<any[]>([])

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamatAsal: '',
    tanggalLahir: '',
    tanggalMasuk: '',
    pekerjaan: '',
    ktpNumber: '',
    status: 'AKTIF',
    fotoKtpUrl: '',
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    fetchPenyewa()
    fetchKamar()
  }, [penyewaId])

  const fetchPenyewa = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/penyewa/${penyewaId}`)
      
      if (!response.ok) throw new Error('Failed to fetch penyewa')
      
      const result = await response.json()
      const penyewa = result.data
      
      setFormData({
        nama: penyewa.nama || '',
        email: penyewa.email || '',
        noHp: penyewa.noHp || '',
        alamatAsal: penyewa.alamatAsal || '',
        tanggalLahir: penyewa.tanggalLahir ? penyewa.tanggalLahir.split('T')[0] : '',
        tanggalMasuk: penyewa.tanggalMasuk ? penyewa.tanggalMasuk.split('T')[0] : '',
        pekerjaan: penyewa.pekerjaan || '',
        ktpNumber: penyewa.ktpNumber || '',
        status: penyewa.status || 'AKTIF',
        fotoKtpUrl: penyewa.fotoKtpUrl || '',
      })
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Gagal memuat data penyewa')
    } finally {
      setLoading(false)
    }
  }

  const fetchKamar = async () => {
    try {
      const response = await fetch('/api/kamar?status=TERSEDIA&limit=100')
      if (response.ok) {
        const result = await response.json()
        const items = result.data?.items || result.data || result || []
        setKamarList(Array.isArray(items) ? items : [])
      }
    } catch (error) {
      console.error('Fetch kamar error:', error)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFotoUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      const url = result.data.url
      setFormData(prev => ({ ...prev, fotoKtpUrl: url }))
      return url
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal upload foto KTP')
      throw error
    }
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}

    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
    if (!formData.noHp.trim()) newErrors.noHp = 'No. HP wajib diisi'
    if (!formData.alamatAsal.trim()) newErrors.alamatAsal = 'Alamat asal wajib diisi'
    if (!formData.tanggalLahir) newErrors.tanggalLahir = 'Tanggal lahir wajib diisi'
    if (!formData.tanggalMasuk) newErrors.tanggalMasuk = 'Tanggal masuk wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/penyewa/${penyewaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update penyewa')
      }

      alert('Penyewa berhasil diupdate!')
      router.push(`/dashboard/penyewa/${penyewaId}`)
    } catch (error: any) {
      console.error('Submit error:', error)
      alert(error.message || 'Gagal mengupdate penyewa')
    } finally {
      setSubmitting(false)
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
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
            <h1 className="text-3xl font-bold text-gray-800">Edit Penyewa</h1>
            <p className="text-gray-600 mt-1">
              Update informasi penyewa
            </p>
          </div>
          <Link href={`/dashboard/penyewa/${penyewaId}`}>
            <Button variant="secondary">
              <FiArrowLeft className="inline mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penyewa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nama Lengkap"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  error={errors.nama}
                  required
                  placeholder="Masukkan nama lengkap"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="email@example.com"
                />

                <Input
                  label="No. HP"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  error={errors.noHp}
                  required
                  placeholder="08xxxxxxxxxx"
                />

                <Input
                  label="Tanggal Lahir"
                  name="tanggalLahir"
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  error={errors.tanggalLahir}
                  required
                />

                <Input
                  label="Nomor KTP"
                  name="ktpNumber"
                  value={formData.ktpNumber}
                  onChange={handleChange}
                  placeholder="Masukkan nomor KTP"
                />

                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  placeholder="Masukkan pekerjaan"
                />

                <Input
                  label="Tanggal Masuk"
                  name="tanggalMasuk"
                  type="date"
                  value={formData.tanggalMasuk}
                  onChange={handleChange}
                  error={errors.tanggalMasuk}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="KELUAR">Keluar</option>
                    <option value="SUSPEND">Suspend</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Asal <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="alamatAsal"
                  value={formData.alamatAsal}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border bg-white text-gray-900 placeholder:text-gray-400 ${
                    errors.alamatAsal ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Masukkan alamat lengkap"
                  required
                />
                {errors.alamatAsal && (
                  <p className="text-red-500 text-sm mt-1">{errors.alamatAsal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto KTP
                </label>
                <FileUpload
                  onUpload={handleFotoUpload}
                  accept="image/*"
                  label="Upload Foto KTP"
                />
                {formData.fotoKtpUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.fotoKtpUrl}
                      alt="Preview KTP"
                      className="max-w-md w-full h-auto rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, fotoKtpUrl: '' }))}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Link href={`/dashboard/penyewa/${penyewaId}`}>
                  <Button type="button" variant="secondary">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                >
                  <FiSave className="inline mr-2" />
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
