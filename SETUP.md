# 🚀 Panduan Setup Lengkap

Panduan langkah demi langkah untuk setup aplikasi Manajemen Kos-Kosan.

## 📝 Langkah 1: Persiapan

### 1.1 Install Node.js

Pastikan Node.js versi 18 atau lebih tinggi sudah terinstall:

```bash
node --version
```

Jika belum, download dari [nodejs.org](https://nodejs.org/)

### 1.2 Install Dependencies

```bash
cd /home/fj/Desktop/PROJECT/KP/kos
npm install
```

## 🗄️ Langkah 2: Setup Database (Neon PostgreSQL)

### 2.1 Buat Akun Neon

1. Buka [neon.tech](https://neon.tech/)
2. Sign up dengan GitHub atau email
3. Verifikasi email Anda

### 2.2 Buat Database

1. Klik "Create Project"
2. Isi nama project: `kos-management`
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Klik "Create Project"

### 2.3 Copy Connection String

1. Di dashboard project, klik "Connection Details"
2. Copy connection string (format PostgreSQL)
3. Contoh format:
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/kos_db?sslmode=require
   ```

### 2.4 Setup Environment Variables

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` dan paste connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/kos_db?sslmode=require"
   ```

### 2.5 Generate Prisma & Migrate

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migration (membuat tabel di database)
npx prisma migrate dev --name init
```

### 2.6 Verifikasi Database (Optional)

```bash
# Buka Prisma Studio untuk melihat database
npx prisma studio
```

Akan terbuka di `http://localhost:5555`

## ☁️ Langkah 3: Setup Cloudinary (File Storage)

### 3.1 Buat Akun Cloudinary

1. Buka [cloudinary.com](https://cloudinary.com/)
2. Sign up gratis
3. Verifikasi email

### 3.2 Dapatkan API Credentials

1. Login ke dashboard
2. Copy informasi berikut:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3.3 Tambahkan ke `.env`

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_URL="cloudinary://your_api_key:your_api_secret@your_cloud_name"
```

### 3.4 Setup Folder di Cloudinary

1. Di dashboard Cloudinary
2. Klik "Media Library"
3. Buat folder baru: `kos-management`
4. Di dalam `kos-management`, buat subfolder:
   - `ktp` (untuk foto KTP)
   - `kamar` (untuk foto kamar)
   - `pengaduan` (untuk foto pengaduan)

## 🔐 Langkah 4: Setup Authentication (Optional - untuk nanti)

### 4.1 Generate Secret

```bash
openssl rand -base64 32
```

### 4.2 Tambahkan ke `.env`

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste_hasil_generate_disini"
```

## 🎨 Langkah 5: Jalankan Aplikasi

### 5.1 Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

### 5.2 Test Aplikasi

1. Buka browser: `http://localhost:3000`
2. Klik menu "Penyewa"
3. Klik "Tambah Penyewa"
4. Isi form dan upload foto KTP
5. Submit

### 5.3 Cek Database

```bash
npx prisma studio
```

Cek apakah data penyewa sudah masuk ke tabel `penyewa`

## ✅ Checklist Setup

- [ ] Node.js terinstall (v18+)
- [ ] Dependencies terinstall (`npm install`)
- [ ] Akun Neon dibuat
- [ ] Database Neon dibuat
- [ ] Connection string di `.env`
- [ ] Prisma migrate berhasil
- [ ] Akun Cloudinary dibuat
- [ ] Cloudinary credentials di `.env`
- [ ] Folder di Cloudinary dibuat
- [ ] App berjalan di `localhost:3000`
- [ ] Test upload foto KTP berhasil

## 🐛 Troubleshooting

### Error: Connection refused

**Problem**: Database connection gagal

**Solusi**:
1. Pastikan connection string benar
2. Cek apakah database Neon masih aktif
3. Cek internet connection

### Error: Module not found

**Problem**: Dependencies belum terinstall

**Solusi**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Prisma Client not generated

**Problem**: Prisma client belum di-generate

**Solusi**:
```bash
npx prisma generate
```

### Error: Upload failed

**Problem**: Cloudinary credentials salah

**Solusi**:
1. Cek kembali credentials di Cloudinary dashboard
2. Pastikan format CLOUDINARY_URL benar
3. Restart dev server setelah update `.env`

### Error: Port 3000 already in use

**Problem**: Port sudah digunakan aplikasi lain

**Solusi**:
```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain
npm run dev -- -p 3001
```

## 📞 Bantuan

Jika masih ada masalah:

1. Cek log error di terminal
2. Cek browser console (F12)
3. Cek `.env` sudah benar
4. Restart development server

## 🎉 Selesai!

Aplikasi siap digunakan! Langkah selanjutnya:

1. ✅ Test semua fitur (Penyewa, Kamar, Pembayaran)
2. ✅ Customize UI sesuai kebutuhan
3. ✅ Deploy ke Vercel (lihat README.md)

---

**Selamat mengembangkan! 🚀**
