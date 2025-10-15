import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: Date | string, formatString: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString, { locale: id })
}

/**
 * Format date to relative time (e.g., "2 jam yang lalu")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) return `${years} tahun yang lalu`
  if (months > 0) return `${months} bulan yang lalu`
  if (days > 0) return `${days} hari yang lalu`
  if (hours > 0) return `${hours} jam yang lalu`
  if (minutes > 0) return `${minutes} menit yang lalu`
  return 'Baru saja'
}

/**
 * Format phone number to Indonesian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Convert to international format
  if (cleaned.startsWith('0')) {
    return `+62${cleaned.substring(1)}`
  }
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`
  }
  return phone
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(lastNumber: number = 0): string {
  const nextNumber = lastNumber + 1
  return `INV-${String(nextNumber).padStart(6, '0')}`
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] || ''
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validate phone number format (Indonesian)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const regex = /^(\+62|62|0)[0-9]{9,12}$/
  return regex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate KTP number
 */
export function isValidKTP(ktp: string): boolean {
  return /^\d{16}$/.test(ktp)
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Get random color for avatar
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Calculate late payment days
 */
export function calculateLateDays(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  const diff = now.getTime() - due.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Penyewa status
    AKTIF: 'bg-green-100 text-green-800',
    KELUAR: 'bg-gray-100 text-gray-800',
    SUSPEND: 'bg-red-100 text-red-800',
    
    // Kamar status
    TERSEDIA: 'bg-green-100 text-green-800',
    TERISI: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-yellow-100 text-yellow-800',
    BOOKING: 'bg-purple-100 text-purple-800',
    PERBAIKAN: 'bg-yellow-100 text-yellow-800',
    
    // Pembayaran status
    PENDING: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
    TELAT: 'bg-red-100 text-red-800',
    BATAL: 'bg-gray-100 text-gray-800',
    
    // Pengaduan status
    BARU: 'bg-blue-100 text-blue-800',
    DIPROSES: 'bg-yellow-100 text-yellow-800',
    SELESAI: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    // Penyewa status
    AKTIF: 'Aktif',
    KELUAR: 'Keluar',
    SUSPEND: 'Suspend',
    
    // Kamar status
    TERSEDIA: 'Tersedia',
    TERISI: 'Terisi',
    MAINTENANCE: 'Perbaikan',
    BOOKING: 'Booking',
    PERBAIKAN: 'Perbaikan',
    
    // Pembayaran status
    PENDING: 'Pending',
    LUNAS: 'Lunas',
    TELAT: 'Terlambat',
    BATAL: 'Batal',
    
    // Pengaduan status
    BARU: 'Baru',
    DIPROSES: 'Diproses',
    SELESAI: 'Selesai',
    DITOLAK: 'Ditolak',
  }
  
  return labels[status] || status
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    RENDAH: 'bg-blue-100 text-blue-800',
    SEDANG: 'bg-yellow-100 text-yellow-800',
    TINGGI: 'bg-orange-100 text-orange-800',
    DARURAT: 'bg-red-100 text-red-800',
  }
  
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
