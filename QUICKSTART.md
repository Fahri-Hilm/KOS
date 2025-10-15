# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi dalam 5 menit!

## ⚡ Langkah Cepat

### 1. Install Dependencies (1 menit)

```bash
npm install
```

### 2. Setup Environment (2 menit)

Buat file `.env` dan isi dengan:

```env
# Minimal Configuration untuk Development
DATABASE_URL="postgresql://user:pass@host/kos_db?sslmode=require"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
```

> **Catatan**: Lihat file `.env.example` untuk konfigurasi lengkap

### 3. Setup Database (1 menit)

```bash
# Generate Prisma Client
npx prisma generate

# Run migration
npx prisma migrate dev --name init
```

### 4. Jalankan Server (30 detik)

```bash
npm run dev
```

Buka: `http://localhost:3000`

## ✅ Testing

### Test API Endpoints

```bash
# Test GET penyewa
curl http://localhost:3000/api/penyewa

# Test GET kamar
curl http://localhost:3000/api/kamar

# Test GET pembayaran
curl http://localhost:3000/api/pembayaran
```

### Test UI

1. Buka `http://localhost:3000/dashboard`
2. Klik "Penyewa" di sidebar
3. Klik "Tambah Penyewa"
4. Isi form dan upload foto KTP
5. Submit!

## 📋 Development Checklist

- [ ] Dependencies terinstall
- [ ] File `.env` sudah ada
- [ ] Database connection berhasil
- [ ] Prisma migrate berhasil
- [ ] Server berjalan di `localhost:3000`
- [ ] Dashboard dapat diakses
- [ ] Form tambah penyewa berfungsi
- [ ] Upload foto berfungsi

## 🔧 Commands Penting

```bash
# Development
npm run dev              # Start dev server

# Database
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations

# Build
npm run build            # Build for production
npm start                # Start production server

# Maintenance
npm run lint             # Check code quality
```

## 🆘 Troubleshooting Cepat

### Port sudah digunakan?

```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain
npm run dev -- -p 3001
```

### Prisma error?

```bash
# Reset semuanya
npx prisma migrate reset
npx prisma generate
```

### Module not found?

```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Next Steps

Setelah setup berhasil:

1. ✅ Explore Dashboard
2. ✅ Tambah data Penyewa
3. ✅ Tambah data Kamar
4. ✅ Test upload foto
5. ✅ Lihat API di `/api/*`
6. ✅ Customize sesuai kebutuhan

## 📚 Dokumentasi Lengkap

- **README.md** - Dokumentasi lengkap
- **SETUP.md** - Panduan setup detail
- **prisma/schema.prisma** - Database schema

## 💡 Tips

- Gunakan Prisma Studio untuk melihat data: `npx prisma studio`
- Hot reload otomatis saat edit file
- Cek terminal untuk error logs
- Gunakan browser DevTools (F12) untuk debug

---

**Happy Coding! 🎉**
