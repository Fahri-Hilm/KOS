'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FileUpload from '@/components/ui/FileUpload'
import { FiArrowLeft, FiSave, FiDollarSign } from 'react-icons/fi'
import { Penyewa, Kamar } from '@/types'
import { formatCurrency, generateInvoiceNumber, getMonthName } from '@/lib/utils'

interface FormErrors {
  [key: string]: string
}

export default function AddPembayaranPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [uploadingBukti, setUploadingBukti] = useState(false)
  
  const [penyewaList, setPenyewaList] = useState<Penyewa[]>([])
  const [kamarList, setKamarList] = useState<Kamar[]>([])
  const [selectedPenyewa, setSelectedPenyewa] = useState<Penyewa | null>(null)
  const [selectedKamar, setSelectedKamar] = useState<Kamar | null>(null)

  const [formData, setFormData] = useState({
    penyewaId: '',
    kamarId: '',
    bulanPembayaran: '',
    jumlah: '',
    metodePembayaran: 'TRANSFER',
    status: 'PENDING',
    tanggalBayar: new Date().toISOString().split('T')[0],
    jatuhTempo: '',
    keterangan: '',
    buktiUrl: '',
  })

  useEffect(() => {
    fetchPenyewa()
    fetchKamar()
    generateBulanPembayaran()
  }, [])

  useEffect(() => {
    if (formData.penyewaId) {
      const penyewa = penyewaList.find(p => p.id === formData.penyewaId)
      setSelectedPenyewa(penyewa || null)
    }
  }, [formData.penyewaId, penyewaList])

  useEffect(() => {
    if (formData.kamarId) {
      const kamar = kamarList.find(k => k.id === formData.kamarId)
      setSelectedKamar(kamar || null)
      if (kamar) {
        setFormData(prev => ({ ...prev, jumlah: kamar.hargaPerBulan.toString() }))
      }
    }
  }, [formData.kamarId, kamarList])

  const fetchPenyewa = async () => {
    try {
      const response = await fetch('/api/penyewa?status=AKTIF')
      const result = await response.json()
      // Handle paginated response
      if (result.data?.items) {
        setPenyewaList(result.data.items)
      } else if (Array.isArray(result.data)) {
        setPenyewaList(result.data)
      } else {
        setPenyewaList([])
      }
    } catch (error) {
      console.error('Failed to fetch penyewa:', error)
      setPenyewaList([])
    }
  }

  const fetchKamar = async () => {
    try {
      const response = await fetch('/api/kamar')
      const result = await response.json()
      // Handle paginated response
      if (result.data?.items) {
        setKamarList(result.data.items)
      } else if (Array.isArray(result.data)) {
        setKamarList(result.data)
      } else {
        setKamarList([])
      }
    } catch (error) {
      console.error('Failed to fetch kamar:', error)
      setKamarList([])
    }
  }

  const generateBulanPembayaran = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const bulan = `${getMonthName(month)} ${year}`
    
    // Set jatuh tempo (tanggal 10 bulan ini)
    const jatuhTempo = new Date(year, month - 1, 10).toISOString().split('T')[0]
    
    setFormData(prev => ({ ...prev, bulanPembayaran: bulan, jatuhTempo }))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBuktiUpload = async (file: File) => {
    try {
      setUploadingBukti(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      setFormData(prev => ({ ...prev, buktiUrl: result.data.url }))
      
      return result.data.url
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, buktiUrl: 'Gagal upload bukti' }))
      throw error
    } finally {
      setUploadingBukti(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.penyewaId) {
      newErrors.penyewaId = 'Pilih penyewa terlebih dahulu'
    }

    if (!formData.kamarId) {
      newErrors.kamarId = 'Pilih kamar terlebih dahulu'
    }

    if (!formData.bulanPembayaran) {
      newErrors.bulanPembayaran = 'Bulan pembayaran wajib diisi'
    }

    if (!formData.jumlah || parseFloat(formData.jumlah) <= 0) {
      newErrors.jumlah = 'Jumlah pembayaran harus lebih dari 0'
    }

    if (!formData.tanggalBayar) {
      newErrors.tanggalBayar = 'Tanggal bayar wajib diisi'
    }

    if (!formData.jatuhTempo) {
      newErrors.jatuhTempo = 'Tanggal jatuh tempo wajib diisi'
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

      // Get last invoice number
      const invoicesResponse = await fetch('/api/pembayaran')
      const invoicesData = await invoicesResponse.json()
      const lastInvoiceNumber = invoicesData.data?.length || 0
      const nomorInvoice = generateInvoiceNumber(lastInvoiceNumber)

      const submitData = {
        nomorInvoice,
        penyewaId: formData.penyewaId,
        kamarId: formData.kamarId,
        bulanPembayaran: formData.bulanPembayaran,
        jumlah: parseFloat(formData.jumlah),
        metodePembayaran: formData.metodePembayaran,
        status: formData.status,
        tanggalBayar: new Date(formData.tanggalBayar).toISOString(),
        jatuhTempo: new Date(formData.jatuhTempo).toISOString(),
        keterangan: formData.keterangan.trim() || null,
        buktiUrl: formData.buktiUrl || null,
      }

      const response = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create pembayaran')
      }

      router.push('/dashboard/pembayaran')
    } catch (error: any) {
      console.error('Submit error:', error)
      setErrors({ submit: error.message || 'Gagal menambahkan pembayaran' })
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
            <h1 className="text-3xl font-bold text-gray-800">Catat Pembayaran Baru</h1>
            <p className="text-gray-600 mt-1">
              Isi form di bawah untuk mencatat pembayaran
            </p>
          </div>
          <Link href="/dashboard/pembayaran">
            <Button variant="secondary">
              <FiArrowLeft className="inline mr-2" />
              Kembali
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {errors.submit}
                      </div>
                    )}

                    {/* Penyewa & Kamar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {penyewa.nama}
                            </option>
                          ))}
                        </select>
                        {errors.penyewaId && (
                          <p className="text-sm text-red-600 mt-1">{errors.penyewaId}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kamar <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="kamarId"
                          value={formData.kamarId}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Pilih Kamar</option>
                          {kamarList.map((kamar) => (
                            <option key={kamar.id} value={kamar.id}>
                              Kamar {kamar.nomorKamar} - {formatCurrency(kamar.hargaPerBulan)}
                            </option>
                          ))}
                        </select>
                        {errors.kamarId && (
                          <p className="text-sm text-red-600 mt-1">{errors.kamarId}</p>
                        )}
                      </div>
                    </div>

                    {/* Bulan Pembayaran */}
                    <Input
                      label="Bulan Pembayaran"
                      name="bulanPembayaran"
                      value={formData.bulanPembayaran}
                      onChange={handleInputChange}
                      placeholder="Contoh: Oktober 2025"
                      error={errors.bulanPembayaran}
                      required
                    />

                    {/* Jumlah & Metode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Jumlah Pembayaran"
                        name="jumlah"
                        type="number"
                        value={formData.jumlah}
                        onChange={handleInputChange}
                        placeholder="Contoh: 1500000"
                        error={errors.jumlah}
                        required
                        min="0"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Metode Pembayaran <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="metodePembayaran"
                          value={formData.metodePembayaran}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="TUNAI">Tunai</option>
                          <option value="TRANSFER">Transfer Bank</option>
                          <option value="EWALLET">E-Wallet</option>
                          <option value="DEBIT">Kartu Debit</option>
                        </select>
                      </div>
                    </div>

                    {/* Tanggal Bayar & Jatuh Tempo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Tanggal Bayar"
                        name="tanggalBayar"
                        type="date"
                        value={formData.tanggalBayar}
                        onChange={handleInputChange}
                        error={errors.tanggalBayar}
                        required
                      />

                      <Input
                        label="Tanggal Jatuh Tempo"
                        name="jatuhTempo"
                        type="date"
                        value={formData.jatuhTempo}
                        onChange={handleInputChange}
                        error={errors.jatuhTempo}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="PENDING">Pending</option>
                        <option value="LUNAS">Lunas</option>
                        <option value="TELAT">Terlambat</option>
                        <option value="BATAL">Batal</option>
                      </select>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keterangan
                      </label>
                      <textarea
                        name="keterangan"
                        value={formData.keterangan}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Catatan tambahan (opsional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Bukti Transfer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bukti Transfer
                      </label>
                      <FileUpload
                        onUpload={handleBuktiUpload}
                        accept="image/*"
                        maxSize={2 * 1024 * 1024}
                        label="Upload bukti transfer (max 2MB)"
                      />
                      {errors.buktiUrl && (
                        <p className="text-sm text-red-600 mt-1">{errors.buktiUrl}</p>
                      )}
                      
                      {formData.buktiUrl && (
                        <div className="mt-4">
                          <img
                            src={formData.buktiUrl}
                            alt="Bukti Transfer"
                            className="max-w-xs rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPenyewa && (
                      <div>
                        <p className="text-sm text-gray-600">Penyewa</p>
                        <p className="font-medium text-gray-900">{selectedPenyewa.nama}</p>
                        <p className="text-sm text-gray-500">{selectedPenyewa.noHp}</p>
                      </div>
                    )}

                    {selectedKamar && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Kamar</p>
                        <p className="font-medium text-gray-900">Kamar {selectedKamar.nomorKamar}</p>
                        <p className="text-sm text-gray-500">{selectedKamar.tipe}</p>
                      </div>
                    )}

                    {formData.jumlah && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(parseFloat(formData.jumlah))}
                        </p>
                      </div>
                    )}

                    {formData.bulanPembayaran && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Periode</p>
                        <p className="font-medium text-gray-900">{formData.bulanPembayaran}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <FiDollarSign className="w-4 h-4" />
                        Invoice akan digenerate otomatis
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={loading || uploadingBukti}
                disabled={loading || uploadingBukti}
              >
                <FiSave className="inline mr-2" />
                Simpan Pembayaran
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
