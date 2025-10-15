'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FiArrowLeft, FiPrinter, FiDownload, FiCheckCircle } from 'react-icons/fi'
import { Pembayaran } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function DetailPembayaranPage() {
  const params = useParams()
  const pembayaranId = params?.id as string

  const [pembayaran, setPembayaran] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (pembayaranId) {
      fetchPembayaranDetail()
    }
  }, [pembayaranId])

  const fetchPembayaranDetail = async () => {
    try {
      setLoading(true)
      console.log('Fetching pembayaran:', pembayaranId)
      
      const response = await fetch(`/api/pembayaran/${pembayaranId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch pembayaran')
      }
      
      setPembayaran(result.data)
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error instanceof Error ? error.message : 'Gagal memuat data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadInvoice = () => {
    // Trigger browser print dialog with save as PDF option
    window.print()
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

  if (error || !pembayaran) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error || 'Pembayaran tidak ditemukan'}</div>
            <Link href="/dashboard/pembayaran">
              <Button variant="primary">Kembali ke Daftar Pembayaran</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header - Hide on print */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detail Pembayaran</h1>
            <p className="text-gray-600 mt-1">
              Invoice: {pembayaran.nomorInvoice}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePrint}>
              <FiPrinter className="inline mr-2" />
              Print
            </Button>
            <Button variant="success" onClick={handleDownloadInvoice}>
              <FiDownload className="inline mr-2" />
              Download PDF
            </Button>
            <Link href="/dashboard/pembayaran">
              <Button variant="secondary">
                <FiArrowLeft className="inline mr-2" />
                Kembali
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoice */}
        <Card className="shadow-xl print:shadow-none">
          <CardContent className="p-0">
            {/* Invoice Header - Brand Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 print:p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-4xl font-bold mb-3 print:text-xl print:mb-0.5">INVOICE</h2>
                  <div className="space-y-1 print:space-y-0 print:text-xs">
                    <p className="text-blue-100 font-medium text-lg print:text-xs print:leading-tight">Sistem Manajemen Kos</p>
                    <p className="text-blue-200 text-sm print:text-xs print:leading-tight">Jl. Contoh No. 123, Kota | Telp: (021) 12345678</p>
                  </div>
                </div>
                <div className="text-right bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm print:p-1.5 print:bg-opacity-30">
                  <p className="text-blue-100 text-sm mb-1 print:text-xs print:mb-0 print:leading-tight">No.</p>
                  <div className="text-2xl font-bold mb-3 print:text-base print:mb-0.5 print:leading-tight">
                    {pembayaran.nomorInvoice}
                  </div>
                  <span className={`inline-block px-4 py-1.5 text-sm font-bold rounded-full print:px-1.5 print:py-0 print:text-xs ${
                    pembayaran.status === 'LUNAS' 
                      ? 'bg-green-500 text-white' 
                      : pembayaran.status === 'PENDING'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {getStatusLabel(pembayaran.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 print:p-3">
              {/* Date Info Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:gap-1.5 print:mb-2">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 print:p-1.5 print:border-l-2">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1 print:mb-0 print:text-xs print:leading-tight">Tgl Invoice</p>
                  <p className="text-lg font-bold text-gray-900 print:text-xs print:leading-tight">{formatDate(pembayaran.tanggalBayar, 'dd MMM yyyy')}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600 print:p-1.5 print:border-l-2">
                  <p className="text-xs font-semibold text-orange-600 uppercase mb-1 print:mb-0 print:text-xs print:leading-tight">Jatuh Tempo</p>
                  <p className="text-lg font-bold text-gray-900 print:text-xs print:leading-tight">{formatDate(pembayaran.jatuhTempo, 'dd MMM yyyy')}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600 print:p-1.5 print:border-l-2">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-1 print:mb-0 print:text-xs print:leading-tight">Periode</p>
                  <p className="text-lg font-bold text-gray-900 print:text-xs print:leading-tight">{pembayaran.bulanPembayaran}</p>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:gap-2 print:mb-2">
                <div className="bg-gray-50 p-6 rounded-lg print:p-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2 print:mb-1 print:text-xs print:leading-tight">
                    <div className="w-1 h-5 bg-blue-600 rounded-full print:h-2"></div>
                    Ditagihkan Kepada
                  </h3>
                  <div className="space-y-3 print:space-y-0">
                    <p className="text-xl font-bold text-gray-900 print:text-sm print:leading-tight">{pembayaran.penyewa?.nama}</p>
                    <div className="space-y-1.5 text-sm print:space-y-0 print:text-xs print:leading-tight">
                      <p className="text-gray-600 flex items-center gap-2 print:gap-1">
                        <span className="font-medium">Email:</span>
                        <span>{pembayaran.penyewa?.email}</span>
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 print:gap-1">
                        <span className="font-medium">HP:</span>
                        <span>{pembayaran.penyewa?.noHp}</span>
                      </p>
                      <p className="text-gray-600 flex items-center gap-2 print:gap-1">
                        <span className="font-medium">Kamar:</span>
                        <span className="px-2 py-1 bg-blue-600 text-white rounded font-semibold print:px-1 print:py-0">
                          {pembayaran.kamar?.nomorKamar}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg print:p-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2 print:mb-1 print:text-xs print:leading-tight">
                    <div className="w-1 h-5 bg-green-600 rounded-full print:h-2"></div>
                    Detail Pembayaran
                  </h3>
                  <div className="space-y-3 print:space-y-0">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 print:py-0.5 print:border-b-0">
                      <span className="text-sm text-gray-600 print:text-xs print:leading-tight">Metode</span>
                      <span className="font-semibold text-gray-900 print:text-xs print:leading-tight">{pembayaran.metodePembayaran}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 print:py-0.5 print:border-b-0">
                      <span className="text-sm text-gray-600 print:text-xs print:leading-tight">Tipe</span>
                      <span className="font-semibold text-gray-900 print:text-xs print:leading-tight">{pembayaran.kamar?.tipe}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 print:py-0.5">
                      <span className="text-sm text-gray-600 print:text-xs print:leading-tight">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold print:px-1.5 print:py-0 ${
                        pembayaran.status === 'LUNAS' 
                          ? 'bg-green-100 text-green-700' 
                          : pembayaran.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getStatusLabel(pembayaran.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Items Table */}
              <div className="mb-8 print:mb-2">
                <div className="bg-gray-50 rounded-t-lg p-4 border-b-2 border-gray-200 print:p-1.5 print:border-b">
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-600 uppercase tracking-wide print:gap-2 print:text-xs">
                    <div className="col-span-7">Deskripsi</div>
                    <div className="col-span-2 text-center">Periode</div>
                    <div className="col-span-3 text-right">Jumlah</div>
                  </div>
                </div>
                <div className="bg-white border-x border-b rounded-b-lg">
                  <div className="p-4 print:p-1.5">
                    <div className="grid grid-cols-12 gap-4 items-center print:gap-2">
                      <div className="col-span-7">
                        <p className="font-bold text-gray-900 text-lg mb-1 print:text-xs print:mb-0 print:leading-tight">
                          Sewa Kamar {pembayaran.kamar?.nomorKamar}
                        </p>
                        <p className="text-sm text-gray-600 print:text-xs print:leading-tight">
                          {pembayaran.kamar?.tipe} • Lt. {pembayaran.kamar?.lantai || '-'}
                        </p>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold print:px-1.5 print:py-0 print:text-xs print:leading-tight">
                          {pembayaran.bulanPembayaran}
                        </span>
                      </div>
                      <div className="col-span-3 text-right">
                        <p className="text-xl font-bold text-gray-900 print:text-sm print:leading-tight">
                          {formatCurrency(pembayaran.jumlah)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Section */}
              <div className="flex justify-end mb-8 print:mb-2">
                <div className="w-full md:w-96 space-y-3 print:space-y-0 print:w-80">
                  <div className="flex justify-between items-center py-2 px-4 print:py-0.5 print:px-2">
                    <span className="text-gray-600 print:text-xs print:leading-tight">Subtotal</span>
                    <span className="font-semibold text-gray-900 print:text-xs print:leading-tight">{formatCurrency(pembayaran.jumlah)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-4 print:py-0.5 print:px-2">
                    <span className="text-gray-600 print:text-xs print:leading-tight">Diskon</span>
                    <span className="font-semibold text-gray-900 print:text-xs print:leading-tight">Rp 0</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-4 print:py-0.5 print:px-2">
                    <span className="text-gray-600 print:text-xs print:leading-tight">Pajak</span>
                    <span className="font-semibold text-gray-900 print:text-xs print:leading-tight">Rp 0</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-3 print:pt-0.5 print:border-t">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 flex justify-between items-center print:p-1.5">
                      <span className="text-white font-bold text-lg print:text-sm print:leading-tight">TOTAL</span>
                      <span className="text-white font-bold text-2xl print:text-base print:leading-tight">
                        {formatCurrency(pembayaran.jumlah)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {pembayaran.keterangan && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 print:p-1.5 print:mb-1.5 print:border-l-2">
                  <div className="flex items-start gap-3 print:gap-1.5">
                    <div className="flex-shrink-0 mt-0.5 print:hidden">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-1 print:text-xs print:mb-0 print:leading-tight">Catatan</h4>
                      <p className="text-amber-800 print:text-xs print:leading-tight">{pembayaran.keterangan}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bukti Transfer - Hide on print to save space */}
              {pembayaran.buktiUrl && (
                <div className="mb-6 print:hidden">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    Bukti Transfer
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <img
                      src={pembayaran.buktiUrl}
                      alt="Bukti Transfer"
                      className="max-w-md mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {pembayaran.status === 'LUNAS' && (
                <div className="mb-6 print:mb-1.5">
                  <div className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 print:py-1.5 print:gap-1.5 print:border">
                    <FiCheckCircle className="w-8 h-8 text-green-600 print:w-4 print:h-4" />
                    <span className="text-xl font-bold text-green-700 print:text-xs print:leading-tight">
                      Pembayaran Telah Lunas
                    </span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t-2 border-gray-200 print:mt-2 print:pt-1.5 print:border-t">
                <div className="text-center space-y-2 print:space-y-0">
                  <p className="text-gray-600 font-medium print:text-xs print:leading-tight">Terima kasih atas pembayaran Anda</p>
                  <p className="text-sm text-gray-500 print:text-xs print:leading-tight">Invoice digenerate otomatis oleh sistem</p>
                  <p className="text-xs text-gray-400 mt-4 print:mt-0.5 print:text-xs print:leading-tight">
                    Dicetak: {formatDate(new Date(), 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
                
                {/* Signature Section */}
                <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-200 print:gap-4 print:mt-2 print:pt-1.5 print:border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-12 print:text-xs print:mb-6 print:leading-tight">Penyewa</p>
                    <div className="border-t-2 border-gray-300 pt-2 print:pt-1 print:border-t">
                      <p className="font-semibold text-gray-900 print:text-xs print:leading-tight">{pembayaran.penyewa?.nama}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-12 print:text-xs print:mb-6 print:leading-tight">Penerima</p>
                    <div className="border-t-2 border-gray-300 pt-2 print:pt-1 print:border-t">
                      <p className="font-semibold text-gray-900 print:text-xs print:leading-tight">Manajemen Kos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Mobile - Hide on print */}
        <div className="print:hidden md:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handlePrint} fullWidth>
              <FiPrinter className="inline mr-2" />
              Print
            </Button>
            <Button variant="success" onClick={handleDownloadInvoice} fullWidth>
              <FiDownload className="inline mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except invoice */
          body {
            margin: 0;
            padding: 0;
            font-size: 10px !important;
          }
          
          /* Hide non-printable elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Show only invoice content */
          body * {
            visibility: hidden;
          }
          
          .space-y-6,
          .space-y-6 * {
            visibility: visible;
          }
          
          .space-y-6 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          /* Ultra compact print layout - 1 page only */
          @page {
            margin: 0.4cm;
            size: A4;
          }
          
          /* Ensure all background colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ultra compact font sizes */
          .print\\:text-xs {
            font-size: 9px !important;
            line-height: 11px !important;
          }
          
          .print\\:text-sm {
            font-size: 10px !important;
            line-height: 12px !important;
          }
          
          .print\\:text-base {
            font-size: 11px !important;
            line-height: 13px !important;
          }
          
          .print\\:text-lg {
            font-size: 12px !important;
            line-height: 14px !important;
          }
          
          .print\\:text-xl {
            font-size: 14px !important;
            line-height: 16px !important;
          }
          
          .print\\:leading-tight {
            line-height: 1.1 !important;
          }
          
          /* Ultra compact spacing */
          .print\\:p-1\.5 {
            padding: 0.25rem !important;
          }
          
          .print\\:p-2 {
            padding: 0.35rem !important;
          }
          
          .print\\:p-3 {
            padding: 0.5rem !important;
          }
          
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          
          .print\\:py-0\.5, .print\\:py-0\\.5 {
            padding-top: 0.1rem !important;
            padding-bottom: 0.1rem !important;
          }
          
          .print\\:py-1\.5 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
          
          .print\\:px-1 {
            padding-left: 0.15rem !important;
            padding-right: 0.15rem !important;
          }
          
          .print\\:px-1\.5 {
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
          }
          
          .print\\:px-2 {
            padding-left: 0.35rem !important;
            padding-right: 0.35rem !important;
          }
          
          .print\\:pt-0\.5 {
            padding-top: 0.1rem !important;
          }
          
          .print\\:pt-1 {
            padding-top: 0.15rem !important;
          }
          
          .print\\:pt-1\.5 {
            padding-top: 0.25rem !important;
          }
          
          .print\\:mb-0 {
            margin-bottom: 0 !important;
          }
          
          .print\\:mb-0\.5 {
            margin-bottom: 0.1rem !important;
          }
          
          .print\\:mb-1 {
            margin-bottom: 0.15rem !important;
          }
          
          .print\\:mb-1\.5 {
            margin-bottom: 0.25rem !important;
          }
          
          .print\\:mb-2 {
            margin-bottom: 0.35rem !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:mt-0\.5 {
            margin-top: 0.1rem !important;
          }
          
          .print\\:mt-2 {
            margin-top: 0.35rem !important;
          }
          
          .print\\:gap-1 {
            gap: 0.15rem !important;
          }
          
          .print\\:gap-1\.5 {
            gap: 0.25rem !important;
          }
          
          .print\\:gap-2 {
            gap: 0.35rem !important;
          }
          
          .print\\:gap-4 {
            gap: 0.7rem !important;
          }
          
          .print\\:space-y-0 > * + * {
            margin-top: 0 !important;
          }
          
          .print\\:h-2 {
            height: 0.35rem !important;
          }
          
          .print\\:w-4 {
            width: 0.7rem !important;
          }
          
          .print\\:h-4 {
            height: 0.7rem !important;
          }
          
          .print\\:w-80 {
            width: 16rem !important;
          }
          
          .print\\:border {
            border-width: 1px !important;
          }
          
          .print\\:border-t {
            border-top-width: 1px !important;
          }
          
          .print\\:border-b-0 {
            border-bottom-width: 0 !important;
          }
          
          .print\\:border-l-2 {
            border-left-width: 2px !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          /* Ensure gradient colors print correctly */
          .bg-gradient-to-r {
            background: linear-gradient(to right, #2563eb, #1e40af) !important;
          }
          
          /* All colored backgrounds */
          .bg-blue-600, .bg-blue-800 {
            background-color: #1e40af !important;
          }
          
          .bg-green-500 {
            background-color: #22c55e !important;
          }
          
          .bg-yellow-500 {
            background-color: #eab308 !important;
          }
          
          .bg-red-500 {
            background-color: #ef4444 !important;
          }
          
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
          
          .bg-orange-50 {
            background-color: #fff7ed !important;
          }
          
          .bg-purple-50 {
            background-color: #faf5ff !important;
          }
          
          .bg-amber-50 {
            background-color: #fffbeb !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .bg-green-600, .bg-green-700 {
            background-color: #16a34a !important;
          }
          
          .bg-blue-100 {
            background-color: #dbeafe !important;
          }
          
          .bg-green-100 {
            background-color: #dcfce7 !important;
          }
          
          .bg-yellow-100 {
            background-color: #fef9c3 !important;
          }
          
          .bg-red-100 {
            background-color: #fee2e2 !important;
          }
          
          /* Text colors */
          .text-white {
            color: white !important;
          }
          
          .text-blue-100 {
            color: #dbeafe !important;
          }
          
          .text-blue-200 {
            color: #bfdbfe !important;
          }
          
          .text-blue-600 {
            color: #2563eb !important;
          }
          
          .text-blue-700 {
            color: #1d4ed8 !important;
          }
          
          .text-green-600 {
            color: #16a34a !important;
          }
          
          .text-green-700 {
            color: #15803d !important;
          }
          
          .text-orange-600 {
            color: #ea580c !important;
          }
          
          .text-purple-600 {
            color: #9333ea !important;
          }
          
          .text-amber-600 {
            color: #d97706 !important;
          }
          
          .text-amber-800 {
            color: #92400e !important;
          }
          
          .text-amber-900 {
            color: #78350f !important;
          }
          
          .text-yellow-700 {
            color: #a16207 !important;
          }
          
          .text-red-700 {
            color: #b91c1c !important;
          }
          
          /* Remove shadows */
          .shadow-xl, .shadow-lg, .shadow {
            box-shadow: none !important;
          }
          
          /* Borders */
          .border, .border-2 {
            border-color: #e5e7eb !important;
          }
          
          .border-blue-600 {
            border-color: #2563eb !important;
          }
          
          .border-orange-600 {
            border-color: #ea580c !important;
          }
          
          .border-purple-600 {
            border-color: #9333ea !important;
          }
          
          .border-amber-500 {
            border-color: #f59e0b !important;
          }
          
          .border-green-200 {
            border-color: #bbf7d0 !important;
          }
          
          /* Avoid page breaks */
          .bg-gray-50, .bg-blue-50, .bg-amber-50 {
            page-break-inside: avoid;
          }
          
          /* Images */
          img {
            max-width: 100%;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
