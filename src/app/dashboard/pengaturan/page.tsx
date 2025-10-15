'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FiUser, FiLock, FiMail, FiSave, FiInfo } from 'react-icons/fi'

export default function PengaturanPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // TODO: Implement profile update API when backend is ready
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Profile berhasil diupdate! (Demo mode - API belum tersedia)' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' })
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' })
      setLoading(false)
      return
    }

    try {
      // TODO: Implement password change API when backend is ready
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Password berhasil diubah! (Demo mode - API belum tersedia)' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengubah password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
          <p className="text-gray-600 mt-2">Kelola profil dan keamanan akun Anda</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Informasi Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Nama"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FiInfo className="text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Role: <span className="font-semibold">{(session?.user as any)?.role || 'ADMIN'}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FiSave />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiLock className="w-5 h-5" />
                Ubah Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Password Saat Ini"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />

                <Input
                  label="Password Baru"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  helperText="Minimal 6 karakter"
                />

                <Input
                  label="Konfirmasi Password Baru"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                  variant="secondary"
                >
                  <FiLock />
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiInfo className="w-5 h-5" />
              Informasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Versi Aplikasi</p>
                <p className="text-lg font-semibold text-gray-800">v1.0.0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Terakhir Login</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-green-600">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tentang Aplikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              Sistem Manajemen Kos adalah aplikasi berbasis web untuk mengelola properti kos-kosan.
              Aplikasi ini menyediakan fitur lengkap untuk manajemen penyewa, kamar, pembayaran,
              pengaduan, dan laporan.
            </p>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                © 2025 Sistem Manajemen Kos. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
