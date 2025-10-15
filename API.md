# 📡 API Documentation

Dokumentasi lengkap untuk semua API endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.vercel.app/api
```

## Response Format

Semua response menggunakan format standar:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

Untuk error:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error detail",
  "errors": {
    "field": ["validation error"]
  }
}
```

---

## 👥 Penyewa API

### GET /api/penyewa

List semua penyewa dengan pagination dan filter.

**Query Parameters:**
- `page` (number) - Halaman (default: 1)
- `limit` (number) - Jumlah per halaman (default: 10)
- `search` (string) - Cari berdasarkan nama, email, atau no HP
- `status` (string) - Filter: AKTIF, KELUAR, SUSPEND

**Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [
      {
        "id": "clx...",
        "nama": "John Doe",
        "email": "john@example.com",
        "noHp": "081234567890",
        "status": "AKTIF",
        "tanggalMasuk": "2024-01-01T00:00:00.000Z",
        "kamar": [
          {
            "id": "clx...",
            "nomorKamar": "101",
            "tipe": "STANDAR",
            "hargaPerBulan": 1000000
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

### GET /api/penyewa/:id

Detail satu penyewa.

**Response:**
```json
{
  "success": true,
  "message": "Penyewa retrieved successfully",
  "data": {
    "id": "clx...",
    "nama": "John Doe",
    "email": "john@example.com",
    "noHp": "081234567890",
    "alamatAsal": "Jakarta",
    "tanggalLahir": "1990-01-01T00:00:00.000Z",
    "pekerjaan": "Software Engineer",
    "fotoKtpUrl": "https://res.cloudinary.com/...",
    "ktpNumber": "3201234567890001",
    "status": "AKTIF",
    "kamar": [...],
    "pembayaran": [...],
    "pengaduan": [...]
  }
}
```

### POST /api/penyewa

Tambah penyewa baru.

**Request Body:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "noHp": "081234567890",
  "alamatAsal": "Jakarta",
  "tanggalLahir": "1990-01-01",
  "pekerjaan": "Software Engineer",
  "ktpNumber": "3201234567890001",
  "fotoKtpUrl": "https://res.cloudinary.com/...",
  "status": "AKTIF"
}
```

**Required Fields:**
- nama
- email
- noHp
- alamatAsal
- tanggalLahir

### PUT /api/penyewa/:id

Update data penyewa.

**Request Body:** Same as POST

### DELETE /api/penyewa/:id

Hapus penyewa.

**Response:**
```json
{
  "success": true,
  "message": "Penyewa deleted successfully",
  "data": null
}
```

---

## 🏠 Kamar API

### GET /api/kamar

List semua kamar.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter: TERSEDIA, TERISI, MAINTENANCE, BOOKING
- `tipe` - Filter: STANDAR, PREMIUM, VIP
- `lantai` - Filter berdasarkan lantai

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "nomorKamar": "101",
        "lantai": 1,
        "tipe": "STANDAR",
        "hargaPerBulan": 1000000,
        "fasilitas": ["AC", "WiFi", "Kamar Mandi Dalam"],
        "status": "TERSEDIA",
        "kapasitas": 1,
        "penyewa": null
      }
    ],
    "pagination": {...}
  }
}
```

### POST /api/kamar

Tambah kamar baru.

**Request Body:**
```json
{
  "nomorKamar": "101",
  "lantai": 1,
  "tipe": "STANDAR",
  "hargaPerBulan": 1000000,
  "fasilitas": ["AC", "WiFi"],
  "status": "TERSEDIA",
  "kapasitas": 1,
  "luasKamar": 12.5,
  "deskripsi": "Kamar nyaman di lantai 1",
  "fotoUrl": ["https://..."]
}
```

### PUT /api/kamar/:id

Update kamar.

### DELETE /api/kamar/:id

Hapus kamar.

---

## 💰 Pembayaran API

### GET /api/pembayaran

List pembayaran.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter status pembayaran
- `penyewaId` - Filter berdasarkan penyewa
- `kamarId` - Filter berdasarkan kamar
- `bulan` - Filter bulan (format: YYYY-MM)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "nomorInvoice": "INV-000001",
        "tanggalBayar": "2024-01-05T00:00:00.000Z",
        "bulanPembayaran": "2024-01",
        "jumlah": 1000000,
        "metodePembayaran": "TRANSFER",
        "status": "LUNAS",
        "penyewa": {...},
        "kamar": {...}
      }
    ]
  }
}
```

### POST /api/pembayaran

Input pembayaran.

**Request Body:**
```json
{
  "penyewaId": "clx...",
  "kamarId": "clx...",
  "bulanPembayaran": "2024-01",
  "jumlah": 1000000,
  "metodePembayaran": "TRANSFER",
  "status": "LUNAS",
  "keterangan": "Pembayaran sewa bulan Januari",
  "buktiUrl": "https://...",
  "jatuhTempo": "2024-01-10"
}
```

**Note:** `nomorInvoice` akan di-generate otomatis.

---

## 🔧 Pengaduan API

### GET /api/pengaduan

List pengaduan.

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter: BARU, DIPROSES, SELESAI, DITOLAK
- `penyewaId` - Filter berdasarkan penyewa
- `kategori` - Filter kategori
- `prioritas` - Filter prioritas

### POST /api/pengaduan

Tambah pengaduan.

**Request Body:**
```json
{
  "penyewaId": "clx...",
  "judul": "AC tidak dingin",
  "deskripsi": "AC di kamar 101 tidak dingin sejak kemarin",
  "kategori": "AC",
  "prioritas": "TINGGI",
  "fotoUrl": ["https://..."]
}
```

---

## 📤 Upload API

### POST /api/upload

Upload file ke Cloudinary.

**Request:** `multipart/form-data`

**Form Fields:**
- `file` (File) - File yang akan diupload
- `folder` (string) - Folder tujuan (optional)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "kos-management/ktp/abc123",
    "format": "jpg",
    "width": 1200,
    "height": 800
  }
}
```

**Validasi:**
- Max size: 2MB
- Allowed types: image/jpeg, image/jpg, image/png

### DELETE /api/upload?publicId=xxx

Hapus file dari Cloudinary.

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

## 🔒 Authentication (Coming Soon)

Semua endpoint akan memerlukan authentication token.

**Header:**
```
Authorization: Bearer <token>
```

## 📝 Rate Limiting (Future)

- 100 requests per minute per IP
- 1000 requests per hour per user

## 🧪 Testing

### Dengan cURL

```bash
# GET Request
curl http://localhost:3000/api/penyewa

# POST Request
curl -X POST http://localhost:3000/api/penyewa \
  -H "Content-Type: application/json" \
  -d '{"nama":"John Doe","email":"john@example.com",...}'

# Upload File
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/ktp.jpg" \
  -F "folder=kos-management/ktp"
```

### Dengan Postman

Import collection dari: [Link to Postman Collection]

---

## 📞 Support

Jika ada pertanyaan tentang API:
- Email: support@example.com
- GitHub Issues: [Link]

---

**Last Updated:** October 2025
