'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi'

interface Penyewa {
  id: string
  nama: string
  email: string
  noHp: string
  status: string
  tanggalMasuk: string
  kamar: Array<{
    id: string
    nomorKamar: string
    tipe: string
  }>
}

export default function PenyewaPage() {
  const [penyewa, setPenyewa] = useState<Penyewa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPenyewa()
  }, [search, statusFilter])

  const fetchPenyewa = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const response = await fetch(`/api/penyewa?${params}`)
      const data = await response.json()

      if (data.success && Array.isArray(data.data.items)) {
        setPenyewa(data.data.items)
      } else if (Array.isArray(data.data)) {
        setPenyewa(data.data)
      } else {
        console.error('API returned non-array data:', data)
        setPenyewa([])
      }
    } catch (error) {
      console.error('Error fetching penyewa:', error)
      setPenyewa([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penyewa ini?')) return

    try {
      const response = await fetch(`/api/penyewa/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPenyewa()
        alert('Penyewa berhasil dihapus')
      }
    } catch (error) {
      console.error('Error deleting penyewa:', error)
      alert('Gagal menghapus penyewa')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      AKTIF: 'bg-green-100 text-green-800',
      KELUAR: 'bg-gray-100 text-gray-800',
      SUSPEND: 'bg-red-100 text-red-800',
    }

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Penyewa</h1>
            <p className="text-gray-600 mt-1">
              Kelola data penyewa kos-kosan
            </p>
          </div>
          <Link href="/dashboard/penyewa/add">
            <Button>
              <FiPlus className="w-5 h-5 mr-2 inline" />
              Tambah Penyewa
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari penyewa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="KELUAR">Keluar</option>
                <option value="SUSPEND">Suspend</option>
              </select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Memuat data...</p>
              </div>
            ) : penyewa.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Tidak ada data penyewa</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email / No HP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kamar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Masuk
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {penyewa.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.nama}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.email}</div>
                          <div className="text-sm text-gray-500">{item.noHp}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.kamar.length > 0 ? (
                            <div className="text-sm text-gray-900">
                              {item.kamar[0].nomorKamar} ({item.kamar[0].tipe})
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.tanggalMasuk).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/dashboard/penyewa/${item.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEye className="w-5 h-5" />
                            </Link>
                            <Link
                              href={`/dashboard/penyewa/${item.id}/edit`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FiEdit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
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
