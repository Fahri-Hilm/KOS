'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { FiArrowLeft, FiSave, FiAlertCircle } from 'react-icons/fi'
import { Penyewa } from '@/types'

interface FormErrors {
  [key: string]: string
}

export default function AddPengaduanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [uploadingFoto, setUploadingFoto] = useState(false)
  
  const [penyewaList, setPenyewaList] = useState<Penyewa[]>([])

  const [formData, setFormData] = useState({
    penyewaId: '',
    judul: '',
    deskripsi: '',
    kategori: 'LAINNYA',
    prioritas: 'SEDANG',
    status: 'BARU',
    fotoUrl: [] as string[],
  })

  useEffect(() => {
    fetchPenyewa()
  }, [])

  const fetchPenyewa = async () => {
    try {
      const response = await fetch('/api/penyewa?status=AKTIF')
      const result = await response.json()
      const dataArray = result.data?.items || result.data || []
      setPenyewaList(Array.isArray(dataArray) ? dataArray : [])
    } catch (error) {
      console.error('Failed to fetch penyewa:', error)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFotoUpload = async (file: File) => {
    try {
      setUploadingFoto(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      setFormData(prev => ({
        ...prev,
        fotoUrl: [...prev.fotoUrl, result.data.url]
      }))
      
      return result.data.url
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, fotoUrl: 'Gagal upload foto' }))
      throw error
    } finally {
      setUploadingFoto(false)
    }
  }

  const handleRemoveFoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotoUrl: prev.fotoUrl.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.penyewaId) {
      newErrors.penyewaId = 'Pilih penyewa terlebih dahulu'
    }

    if (!formData.judul.trim()) {
      newErrors.judul = 'Judul pengaduan wajib diisi'
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi pengaduan wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const submitData = {
        penyewaId: formData.penyewaId,
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        kategori: formData.kategori,
        prioritas: formData.prioritas,
        status: formData.status,
        fotoUrl: formData.fotoUrl,
      }

      const response = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create pengaduan')
      }

      router.push('/dashboard/pengaduan')
    } catch (error: any) {
      console.error('Submit error:', error)
      setErrors({ submit: error.message || 'Gagal menambahkan pengaduan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tambah Pengaduan Baru</h1>
            <p className="text-gray-600 mt-1">
              Isi form di bawah untuk mencatat pengaduan
            </p>
          </div>
          <Link href="/dashboard/pengaduan">
            <Button variant="secondary">
              <FiArrowLeft className="inline mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengaduan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Penyewa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penyewa <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="penyewaId"
                    value={formData.penyewaId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Penyewa</option>
                    {penyewaList.map((penyewa) => (
                      <option key={penyewa.id} value={penyewa.id}>
                        {penyewa.nama} - {penyewa.noHp}
                      </option>
                    ))}
                  </select>
                  {errors.penyewaId && (
                    <p className="text-sm text-red-600 mt-1">{errors.penyewaId}</p>
                  )}
                </div>

                {/* Judul */}
                <Input
                  label="Judul Pengaduan"
                  name="judul"
                  value={formData.judul}
                  onChange={handleInputChange}
                  placeholder="Contoh: AC Tidak Dingin"
                  error={errors.judul}
                  required
                />

                {/* Kategori & Prioritas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="LISTRIK">Listrik</option>
                      <option value="AIR">Air</option>
                      <option value="KAMAR_MANDI">Kamar Mandi</option>
                      <option value="FURNITURE">Furniture</option>
                      <option value="AC">AC</option>
                      <option value="KEBERSIHAN">Kebersihan</option>
                      <option value="KEAMANAN">Keamanan</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioritas <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="prioritas"
                      value={formData.prioritas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="RENDAH">Rendah</option>
                      <option value="SEDANG">Sedang</option>
                      <option value="TINGGI">Tinggi</option>
                      <option value="DARURAT">Darurat</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Jelaskan detail masalah yang dihadapi..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.deskripsi && (
                    <p className="text-sm text-red-600 mt-1">{errors.deskripsi}</p>
                  )}
                </div>

                {/* Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Pengaduan
                  </label>
                  <FileUpload
                    onUpload={handleFotoUpload}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024}
                    label="Upload foto pengaduan (max 2MB)"
                  />
                  {errors.fotoUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.fotoUrl}</p>
                  )}
                  
                  {/* Photo Preview */}
                  {formData.fotoUrl.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.fotoUrl.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFoto(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Link href="/dashboard/pengaduan">
                    <Button type="button" variant="secondary">
                      Batal
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading || uploadingFoto}
                    disabled={loading || uploadingFoto}
                  >
                    <FiSave className="inline mr-2" />
                    Simpan Pengaduan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
