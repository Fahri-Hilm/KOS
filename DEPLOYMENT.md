# 🚀 Panduan Deploy ke Vercel

Sistem Manajemen Kos - Panduan Deployment Lengkap

## 📋 Persiapan Sebelum Deploy

### 1. Setup Database PostgreSQL (Neon.tech - GRATIS)

1. **Buat Akun Neon.tech**
   - Kunjungi: https://neon.tech
   - Sign up dengan GitHub/Google
   - Pilih plan Free (sudah cukup untuk production)

2. **Buat Database Baru**
   - Klik "Create Project"
   - Nama project: `kos-management`
   - Region: Pilih yang terdekat (Singapore/Tokyo)
   - PostgreSQL version: 15 atau terbaru
   - Klik "Create Project"

3. **Dapatkan Connection String**
   - Setelah project dibuat, copy **Connection String**
   - Format: `postgresql://username:password@ep-xxx.region.aws.neon.tech/kos_db?sslmode=require`
   - **SIMPAN CONNECTION STRING INI!**

### 2. Generate Auth Secret

Jalankan command ini di terminal untuk generate secret key:

```bash
openssl rand -base64 32
```

**SIMPAN HASIL OUTPUT INI!** Akan digunakan untuk `AUTH_SECRET`

### 3. Setup Cloudinary (Optional - untuk Upload Gambar)

Jika ingin upload gambar (foto KTP, bukti transfer, dll):

1. **Buat Akun Cloudinary**
   - Kunjungi: https://cloudinary.com
   - Sign up gratis
   - Pilih plan Free (25GB storage gratis)

2. **Dapatkan Credentials**
   - Dashboard → Account Details
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

---

## 🚀 Deploy ke Vercel

### Method 1: Deploy via Vercel Dashboard (RECOMMENDED)

#### Step 1: Push ke GitHub

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create repository di GitHub (via website)
# Kemudian connect:
git remote add origin https://github.com/USERNAME/kos-management.git
git branch -M main
git push -u origin main
```

#### Step 2: Import Project ke Vercel

1. **Login ke Vercel**
   - Kunjungi: https://vercel.com
   - Sign up/Login dengan GitHub

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository GitHub Anda: `kos-management`
   - Klik "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Environment Variables**
   
   Klik "Environment Variables" dan tambahkan:

   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/kos_db?sslmode=require
   
   AUTH_SECRET=your-generated-secret-from-openssl
   
   AUTH_URL=https://your-project-name.vercel.app
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   **PENTING:**
   - `DATABASE_URL` = Connection string dari Neon.tech
   - `AUTH_SECRET` = Secret dari openssl command
   - `AUTH_URL` = URL vercel Anda (akan muncul setelah deploy)

5. **Deploy**
   - Klik "Deploy"
   - Wait 2-3 menit
   - ✅ Deploy Success!

#### Step 3: Setup Database (Migrasi)

Setelah deploy pertama kali, setup database:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login & Link Project**
   ```bash
   vercel login
   vercel link
   ```

3. **Run Prisma Migration di Production**
   ```bash
   # Pull environment variables
   vercel env pull .env.production
   
   # Generate Prisma Client
   npx prisma generate
   
   # Run migration
   npx prisma migrate deploy
   
   # Seed database (create admin user)
   npx prisma db seed
   ```

4. **Atau via Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add `DATABASE_URL`
   - Redeploy project
   - Database akan otomatis ter-migrate

---

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (ikuti prompts)
vercel

# Untuk production deploy
vercel --prod
```

---

## 🔧 Post-Deployment Setup

### 1. Update Auth URL

Setelah dapat URL production (misal: `https://kos-management.vercel.app`):

1. Kembali ke Vercel Dashboard
2. Project Settings → Environment Variables
3. Edit `AUTH_URL` menjadi URL production Anda
4. Redeploy (auto-trigger)

### 2. Create Admin User

Login ke database dan jalankan:

```sql
-- Via Neon.tech SQL Editor atau psql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@kos.com',
  '$2a$10$YourHashedPasswordHere',
  'Administrator',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Atau via Prisma Studio:**
```bash
npx prisma studio
```

### 3. Verify Deployment

1. Kunjungi: `https://your-project.vercel.app`
2. Login dengan admin credentials
3. Test semua fitur:
   - ✅ Dashboard
   - ✅ Penyewa CRUD
   - ✅ Kamar CRUD
   - ✅ Pembayaran & Invoice
   - ✅ Pengaduan
   - ✅ Laporan

---

## ⚙️ Environment Variables Reference

Semua env vars yang dibutuhkan:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `AUTH_SECRET` | ✅ Yes | NextAuth secret key | `generated-secret-32-chars` |
| `AUTH_URL` | ✅ Yes | Production URL | `https://yourapp.vercel.app` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ⚠️ Optional | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | ⚠️ Optional | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ⚠️ Optional | Cloudinary API secret | `abcdefghijklmnop` |

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Solution:**
- Pastikan `DATABASE_URL` sudah ditambahkan di Vercel
- Pastikan connection string memiliki `?sslmode=require`
- Test connection via Neon.tech dashboard

### Error: "Auth error - no secret"

**Solution:**
- Tambahkan `AUTH_SECRET` di environment variables
- Pastikan sudah generate dengan `openssl rand -base64 32`
- Redeploy setelah add env var

### Error: "Prisma Client not found"

**Solution:**
- Tambahkan postinstall script di `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```
- Redeploy

### Error: "Image upload failed"

**Solution:**
- Pastikan Cloudinary env vars sudah ditambahkan
- Atau gunakan base64 upload tanpa Cloudinary

### Build Error: "Module not found"

**Solution:**
```bash
# Clear cache & rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard Features:

1. **Analytics** - Track page views, performance
2. **Logs** - Real-time function logs
3. **Deployments** - History & rollback
4. **Domains** - Custom domain setup

### Database Monitoring (Neon.tech):

1. **Metrics** - CPU, Memory, Storage usage
2. **Queries** - Slow query detection
3. **Backups** - Auto daily backups

---

## 🔄 Continuous Deployment

Vercel auto-deploys pada setiap push ke GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel auto-detects & deploys
# Preview deployments untuk branches lain
```

---

## 🎯 Custom Domain (Optional)

1. Beli domain (Namecheap, GoDaddy, dll)
2. Vercel Dashboard → Domains
3. Add domain Anda
4. Update DNS records sesuai instruksi
5. Wait 24-48 jam untuk propagasi

---

## ✅ Checklist Deploy

- [ ] Database PostgreSQL di Neon.tech
- [ ] Auth secret generated
- [ ] GitHub repository created
- [ ] Vercel account ready
- [ ] Environment variables configured
- [ ] Project deployed
- [ ] Database migrated
- [ ] Admin user created
- [ ] Application tested
- [ ] Custom domain (optional)

---

## 📞 Support

Jika ada masalah:

1. Check Vercel function logs
2. Check Neon.tech database status
3. Verify all environment variables
4. Check GitHub Actions (if any)

---

## 🎉 Congratulations!

Aplikasi Anda sekarang LIVE di production! 🚀

**Next Steps:**
- Monitor performance via Vercel Analytics
- Setup custom domain
- Configure email notifications
- Add more features

---

**Developed with ❤️ using Next.js, Prisma, and PostgreSQL**
