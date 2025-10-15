'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function AddPenyewaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: '',
    alamatAsal: '',
    tanggalLahir: '',
    pekerjaan: '',
    ktpNumber: '',
    fotoKtpUrl: '',
    status: 'AKTIF',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleKtpUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'kos-management/ktp')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Upload failed')
    }

    setFormData((prev) => ({ ...prev, fotoKtpUrl: data.data.url }))
    return data.data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/penyewa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('Penyewa berhasil ditambahkan')
        router.push('/dashboard/penyewa')
      } else {
        if (data.errors) {
          const errorObj: Record<string, string> = {}
          Object.keys(data.errors).forEach((key) => {
            errorObj[key] = data.errors[key][0]
          })
          setErrors(errorObj)
        } else {
          alert(data.message || 'Terjadi kesalahan')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menambahkan penyewa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/penyewa">
            <Button variant="secondary" size="sm">
              <FiArrowLeft className="w-4 h-4 mr-2 inline" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tambah Penyewa</h1>
            <p className="text-gray-600 mt-1">Tambahkan data penyewa baru</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Data Penyewa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  error={errors.nama}
                  placeholder="Masukkan nama lengkap"
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                  placeholder="contoh@email.com"
                />

                <Input
                  label="No HP"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  required
                  error={errors.noHp}
                  placeholder="08123456789"
                />

                <Input
                  label="Tanggal Lahir"
                  name="tanggalLahir"
                  type="date"
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  required
                  error={errors.tanggalLahir}
                />

                <Input
                  label="Pekerjaan"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  placeholder="Masukkan pekerjaan"
                />

                <Input
                  label="Nomor KTP"
                  name="ktpNumber"
                  value={formData.ktpNumber}
                  onChange={handleChange}
                  placeholder="16 digit nomor KTP"
                  maxLength={16}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Asal
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="alamatAsal"
                    value={formData.alamatAsal}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan alamat lengkap"
                  />
                  {errors.alamatAsal && (
                    <p className="mt-1 text-sm text-red-500">{errors.alamatAsal}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="KELUAR">Keluar</option>
                    <option value="SUSPEND">Suspend</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <FileUpload
                  label="Upload Foto KTP"
                  accept="image/jpeg,image/jpg,image/png"
                  maxSize={2097152}
                  onUpload={handleKtpUpload}
                  currentUrl={formData.fotoKtpUrl}
                  error={errors.fotoKtpUrl}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload foto KTP untuk verifikasi identitas (maksimal 2MB)
                </p>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <Link href="/dashboard/penyewa">
                  <Button type="button" variant="secondary">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" loading={loading}>
                  Simpan Penyewa
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  )
}
