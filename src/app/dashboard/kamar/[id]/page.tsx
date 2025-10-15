'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { FiArrowLeft, FiSave } from 'react-icons/fi'

interface FormErrors {
  [key: string]: string
}

export default function EditKamarPage() {
  const router = useRouter()
  const params = useParams()
  const kamarId = params?.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  const [formData, setFormData] = useState({
    nomorKamar: '',
    lantai: '',
    tipe: 'STANDAR',
    hargaPerBulan: '',
    fasilitas: '',
    status: 'TERSEDIA',
    kapasitas: '',
    luasKamar: '',
    deskripsi: '',
    fotoUrl: [] as string[],
  })

  useEffect(() => {
    if (kamarId) {
      fetchKamarDetail()
    }
  }, [kamarId])

  const fetchKamarDetail = async () => {
    try {
      setFetching(true)
      const response = await fetch(`/api/kamar/${kamarId}`)
      
      if (!response.ok) throw new Error('Failed to fetch kamar')
      
      const result = await response.json()
      const kamar = result.data

      // Populate form with existing data
      setFormData({
        nomorKamar: kamar.nomorKamar || '',
        lantai: kamar.lantai?.toString() || '',
        tipe: kamar.tipe || 'STANDAR',
        hargaPerBulan: kamar.hargaPerBulan?.toString() || '',
        fasilitas: Array.isArray(kamar.fasilitas) 
          ? kamar.fasilitas.join(', ') 
          : kamar.fasilitas || '',
        status: kamar.status || 'TERSEDIA',
        kapasitas: kamar.kapasitas?.toString() || '',
        luasKamar: kamar.luasKamar?.toString() || '',
        deskripsi: kamar.deskripsi || '',
        fotoUrl: Array.isArray(kamar.fotoUrl) ? kamar.fotoUrl : [],
      })
    } catch (error) {
      console.error('Fetch error:', error)
      setErrors({ fetch: 'Gagal memuat data kamar' })
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true)
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
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotoUrl: prev.fotoUrl.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nomorKamar.trim()) {
      newErrors.nomorKamar = 'Nomor kamar wajib diisi'
    }

    if (!formData.lantai || parseInt(formData.lantai) < 1) {
      newErrors.lantai = 'Lantai harus minimal 1'
    }

    if (!formData.hargaPerBulan || parseFloat(formData.hargaPerBulan) < 0) {
      newErrors.hargaPerBulan = 'Harga harus diisi dengan benar'
    }

    if (!formData.fasilitas.trim()) {
      newErrors.fasilitas = 'Fasilitas wajib diisi'
    }

    if (!formData.kapasitas || parseInt(formData.kapasitas) < 1) {
      newErrors.kapasitas = 'Kapasitas harus minimal 1 orang'
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
        nomorKamar: formData.nomorKamar.trim(),
        lantai: parseInt(formData.lantai),
        tipe: formData.tipe,
        hargaPerBulan: parseFloat(formData.hargaPerBulan),
        fasilitas: formData.fasilitas.split(',').map(f => f.trim()),
        status: formData.status,
        kapasitas: parseInt(formData.kapasitas),
        luasKamar: formData.luasKamar ? parseFloat(formData.luasKamar) : null,
        deskripsi: formData.deskripsi.trim() || null,
        fotoUrl: formData.fotoUrl,
      }

      const response = await fetch(`/api/kamar/${kamarId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update kamar')
      }

      router.push('/dashboard/kamar')
    } catch (error: any) {
      console.error('Submit error:', error)
      setErrors({ submit: error.message || 'Gagal mengupdate kamar' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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

  if (errors.fetch) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{errors.fetch}</div>
            <Link href="/dashboard/kamar">
              <Button variant="primary">Kembali ke Daftar Kamar</Button>
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
            <h1 className="text-3xl font-bold text-gray-800">Edit Kamar</h1>
            <p className="text-gray-600 mt-1">
              Update informasi kamar {formData.nomorKamar}
            </p>
          </div>
          <Link href="/dashboard/kamar">
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
              <CardTitle>Informasi Kamar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.submit}
                  </div>
                )}

                {/* Row 1: Nomor Kamar, Lantai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nomor Kamar"
                    name="nomorKamar"
                    value={formData.nomorKamar}
                    onChange={handleInputChange}
                    placeholder="Contoh: 101, A1, dll"
                    error={errors.nomorKamar}
                    required
                  />

                  <Input
                    label="Lantai"
                    name="lantai"
                    type="number"
                    value={formData.lantai}
                    onChange={handleInputChange}
                    placeholder="Contoh: 1, 2, 3"
                    error={errors.lantai}
                    required
                    min="1"
                  />
                </div>

                {/* Row 2: Tipe, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Kamar <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tipe"
                      value={formData.tipe}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="STANDAR">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="TERSEDIA">Tersedia</option>
                      <option value="TERISI">Terisi</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="BOOKING">Booking</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Harga, Kapasitas, Luas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Harga per Bulan"
                    name="hargaPerBulan"
                    type="number"
                    value={formData.hargaPerBulan}
                    onChange={handleInputChange}
                    placeholder="Contoh: 1500000"
                    error={errors.hargaPerBulan}
                    required
                    min="0"
                  />

                  <Input
                    label="Kapasitas"
                    name="kapasitas"
                    type="number"
                    value={formData.kapasitas}
                    onChange={handleInputChange}
                    placeholder="Jumlah orang"
                    error={errors.kapasitas}
                    required
                    min="1"
                  />

                  <Input
                    label="Luas Kamar (m²)"
                    name="luasKamar"
                    type="number"
                    value={formData.luasKamar}
                    onChange={handleInputChange}
                    placeholder="Opsional"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Fasilitas */}
                <div>
                  <Input
                    label="Fasilitas"
                    name="fasilitas"
                    value={formData.fasilitas}
                    onChange={handleInputChange}
                    placeholder="Pisahkan dengan koma. Contoh: AC, Kasur, Lemari, Meja Belajar"
                    error={errors.fasilitas}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pisahkan setiap fasilitas dengan koma (,)
                  </p>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Deskripsi tambahan tentang kamar (opsional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Foto Kamar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Kamar
                  </label>
                  <FileUpload
                    onUpload={handlePhotoUpload}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024}
                    label="Upload foto kamar (max 2MB)"
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
                            onClick={() => handleRemovePhoto(index)}
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
                  <Link href="/dashboard/kamar">
                    <Button type="button" variant="secondary">
                      Batal
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading || uploadingPhoto}
                    disabled={loading || uploadingPhoto}
                  >
                    <FiSave className="inline mr-2" />
                    Update Kamar
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
