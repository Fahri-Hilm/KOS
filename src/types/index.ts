// Types for Penyewa
export interface Penyewa {
  id: string
  nama: string
  email: string
  noHp: string
  alamatAsal: string
  tanggalLahir: Date | string
  pekerjaan?: string | null
  fotoKtpUrl?: string | null
  ktpNumber?: string | null
  status: 'AKTIF' | 'KELUAR' | 'SUSPEND'
  tanggalMasuk: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PenyewaWithRelations extends Penyewa {
  kamar?: Kamar[]
  pembayaran?: Pembayaran[]
  pengaduan?: Pengaduan[]
}

// Types for Kamar
export interface Kamar {
  id: string
  nomorKamar: string
  lantai: number
  tipe: 'STANDAR' | 'PREMIUM' | 'VIP'
  harga: number
  hargaPerBulan: number
  fasilitas: string | string[]
  status: 'TERSEDIA' | 'TERISI' | 'MAINTENANCE' | 'BOOKING' | 'PERBAIKAN'
  kapasitas: number
  luasKamar?: number | null
  deskripsi?: string | null
  fotoUrl: string | string[]
  penyewaId?: string | null
  penyewa?: Penyewa | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface KamarWithRelations extends Kamar {
  penyewa?: Penyewa | null
  pembayaran?: Pembayaran[]
  perawatan?: Perawatan[]
}

// Types for Pembayaran
export interface Pembayaran {
  id: string
  nomorInvoice: string
  tanggalBayar: Date | string
  bulanPembayaran: string
  jumlah: number
  metodePembayaran: 'TUNAI' | 'TRANSFER' | 'EWALLET' | 'DEBIT'
  status: 'PENDING' | 'LUNAS' | 'TELAT' | 'BATAL'
  keterangan?: string | null
  buktiUrl?: string | null
  jatuhTempo: Date | string
  penyewaId: string
  kamarId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PembayaranWithRelations extends Pembayaran {
  penyewa?: Penyewa
  kamar?: Kamar
}

// Types for Pengaduan
export interface Pengaduan {
  id: string
  judul: string
  deskripsi: string
  kategori: 'LISTRIK' | 'AIR' | 'KAMAR_MANDI' | 'FURNITURE' | 'AC' | 'KEBERSIHAN' | 'KEAMANAN' | 'LAINNYA'
  prioritas: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'DARURAT'
  status: 'BARU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK'
  fotoUrl: string[]
  tanggapan?: string | null
  biayaPerbaikan?: number | null
  diselesaikanPada?: Date | string | null
  penyewaId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PengaduanWithRelations extends Pengaduan {
  penyewa?: Penyewa
}

// Types for Perawatan
export interface Perawatan {
  id: string
  tanggalPerawatan: Date | string
  jenisPerawatan: string
  deskripsi?: string | null
  biaya: number
  teknisi?: string | null
  kamarId: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PerawatanWithRelations extends Perawatan {
  kamar?: Kamar
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Form types
export interface PenyewaFormData {
  nama: string
  email: string
  noHp: string
  alamatAsal: string
  tanggalLahir: string
  pekerjaan?: string
  ktpNumber?: string
  fotoKtpUrl?: string
  status: 'AKTIF' | 'KELUAR' | 'SUSPEND'
  tanggalMasuk?: string
}

export interface KamarFormData {
  nomorKamar: string
  lantai: number
  tipe: 'STANDAR' | 'PREMIUM' | 'VIP'
  hargaPerBulan: number
  fasilitas: string[]
  status: 'TERSEDIA' | 'TERISI' | 'MAINTENANCE' | 'BOOKING'
  kapasitas: number
  luasKamar?: number
  deskripsi?: string
  fotoUrl: string[]
  penyewaId?: string
}

export interface PembayaranFormData {
  penyewaId: string
  kamarId: string
  bulanPembayaran: string
  jumlah: number
  metodePembayaran: 'TUNAI' | 'TRANSFER' | 'EWALLET' | 'DEBIT'
  status?: 'PENDING' | 'LUNAS' | 'TELAT' | 'BATAL'
  keterangan?: string
  buktiUrl?: string
  jatuhTempo: string
  tanggalBayar?: string
}

export interface PengaduanFormData {
  penyewaId: string
  judul: string
  deskripsi: string
  kategori: 'LISTRIK' | 'AIR' | 'KAMAR_MANDI' | 'FURNITURE' | 'AC' | 'KEBERSIHAN' | 'KEAMANAN' | 'LAINNYA'
  prioritas?: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'DARURAT'
  fotoUrl?: string[]
}

// Upload types
export interface UploadResult {
  url: string
  publicId: string
  format: string
  width: number
  height: number
}
