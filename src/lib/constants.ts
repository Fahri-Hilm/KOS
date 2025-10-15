// Status constants
export const STATUS_PENYEWA = {
  AKTIF: 'AKTIF',
  KELUAR: 'KELUAR',
  SUSPEND: 'SUSPEND',
} as const

export const STATUS_KAMAR = {
  TERSEDIA: 'TERSEDIA',
  TERISI: 'TERISI',
  MAINTENANCE: 'MAINTENANCE',
  BOOKING: 'BOOKING',
} as const

export const TIPE_KAMAR = {
  STANDAR: 'STANDAR',
  PREMIUM: 'PREMIUM',
  VIP: 'VIP',
} as const

export const STATUS_PEMBAYARAN = {
  PENDING: 'PENDING',
  LUNAS: 'LUNAS',
  TELAT: 'TELAT',
  BATAL: 'BATAL',
} as const

export const METODE_PEMBAYARAN = {
  TUNAI: 'TUNAI',
  TRANSFER: 'TRANSFER',
  EWALLET: 'EWALLET',
  DEBIT: 'DEBIT',
} as const

export const KATEGORI_PENGADUAN = {
  LISTRIK: 'LISTRIK',
  AIR: 'AIR',
  KAMAR_MANDI: 'KAMAR_MANDI',
  FURNITURE: 'FURNITURE',
  AC: 'AC',
  KEBERSIHAN: 'KEBERSIHAN',
  KEAMANAN: 'KEAMANAN',
  LAINNYA: 'LAINNYA',
} as const

export const PRIORITAS_PENGADUAN = {
  RENDAH: 'RENDAH',
  SEDANG: 'SEDANG',
  TINGGI: 'TINGGI',
  DARURAT: 'DARURAT',
} as const

export const STATUS_PENGADUAN = {
  BARU: 'BARU',
  DIPROSES: 'DIPROSES',
  SELESAI: 'SELESAI',
  DITOLAK: 'DITOLAK',
} as const

// Labels for display
export const STATUS_PENYEWA_LABELS = {
  AKTIF: 'Aktif',
  KELUAR: 'Keluar',
  SUSPEND: 'Suspend',
}

export const STATUS_KAMAR_LABELS = {
  TERSEDIA: 'Tersedia',
  TERISI: 'Terisi',
  MAINTENANCE: 'Maintenance',
  BOOKING: 'Booking',
}

export const TIPE_KAMAR_LABELS = {
  STANDAR: 'Standar',
  PREMIUM: 'Premium',
  VIP: 'VIP',
}

export const STATUS_PEMBAYARAN_LABELS = {
  PENDING: 'Pending',
  LUNAS: 'Lunas',
  TELAT: 'Terlambat',
  BATAL: 'Dibatalkan',
}

export const METODE_PEMBAYARAN_LABELS = {
  TUNAI: 'Tunai',
  TRANSFER: 'Transfer Bank',
  EWALLET: 'E-Wallet',
  DEBIT: 'Kartu Debit',
}

export const KATEGORI_PENGADUAN_LABELS = {
  LISTRIK: 'Listrik',
  AIR: 'Air',
  KAMAR_MANDI: 'Kamar Mandi',
  FURNITURE: 'Furniture',
  AC: 'AC',
  KEBERSIHAN: 'Kebersihan',
  KEAMANAN: 'Keamanan',
  LAINNYA: 'Lainnya',
}

export const PRIORITAS_PENGADUAN_LABELS = {
  RENDAH: 'Rendah',
  SEDANG: 'Sedang',
  TINGGI: 'Tinggi',
  DARURAT: 'Darurat',
}

export const STATUS_PENGADUAN_LABELS = {
  BARU: 'Baru',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DITOLAK: 'Ditolak',
}

// Validation constants
export const VALIDATION = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  MIN_PASSWORD_LENGTH: 8,
  PHONE_REGEX: /^(\+62|62|0)[0-9]{9,12}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  KTP_LENGTH: 16,
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

// Date formats
export const DATE_FORMAT = {
  DISPLAY: 'dd MMMM yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd MMM yyyy HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
  BULAN_PEMBAYARAN: 'yyyy-MM', // Format untuk bulanPembayaran
}

// Currency format
export const CURRENCY = {
  LOCALE: 'id-ID',
  CURRENCY_CODE: 'IDR',
  SYMBOL: 'Rp',
}

// Export all as default object
export default {
  STATUS_PENYEWA,
  STATUS_KAMAR,
  TIPE_KAMAR,
  STATUS_PEMBAYARAN,
  METODE_PEMBAYARAN,
  KATEGORI_PENGADUAN,
  PRIORITAS_PENGADUAN,
  STATUS_PENGADUAN,
  VALIDATION,
  PAGINATION,
  DATE_FORMAT,
  CURRENCY,
}
