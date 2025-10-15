# 🚀 Panduan Deploy ke Vercel

## Langkah Cepat (15 Menit) ⚡

### 1️⃣ Setup Database PostgreSQL (5 menit)

**Gunakan Neon.tech (GRATIS selamanya):**

1. Buka: https://neon.tech
2. Sign up dengan GitHub
3. Create New Project:
   - Name: `kos-management`
   - Region: **Singapore** (terdekat)
   - PostgreSQL version: 16
4. **COPY Connection String** (ada di Dashboard)
   ```
   postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2️⃣ Generate Auth Secret (30 detik)

```bash
# Jalankan di terminal:
openssl rand -base64 32

# Output contoh:
# abc123xyz789...
# COPY OUTPUT INI!
```

### 3️⃣ Push ke GitHub (3 menit)

```bash
# Jika belum init git:
git init
git add .
git commit -m "Initial commit - Kos Management System"

# Create repository baru di GitHub.com
# Kemudian:
git remote add origin https://github.com/USERNAME/kos-management.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy ke Vercel (5 menit)

#### A. Login ke Vercel
1. Buka: https://vercel.com
2. Sign up/Login dengan GitHub
3. Authorize Vercel access

#### B. Import Project
1. Klik **"Add New..."** → **"Project"**
2. Select GitHub repository: `kos-management`
3. Klik **"Import"**

#### C. Configure Environment Variables
Tambahkan di **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://...` (dari Neon.tech) |
| `AUTH_SECRET` | Output dari `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` (bisa diisi nanti) |

**Optional (jika pakai Cloudinary):**
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

#### D. Deploy!
1. Klik **"Deploy"**
2. Tunggu 2-3 menit
3. Vercel akan memberikan URL: `https://kos-management-xxx.vercel.app`

### 5️⃣ Update AUTH_URL (1 menit)

Setelah dapat URL deployment:

1. Go to **Settings** → **Environment Variables**
2. Edit `AUTH_URL`:
   - From: `https://your-app.vercel.app`
   - To: `https://kos-management-xxx.vercel.app` (URL asli Anda)
3. **Redeploy:** Klik **"Deployments"** → **"..."** → **"Redeploy"**

### 6️⃣ Migrate Database (2 menit)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production

# Migrate database
npx prisma migrate deploy
```

### 7️⃣ Create Admin User (1 menit)

```bash
# Generate password hash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"

# Copy hash, lalu:
npx prisma studio

# Di Prisma Studio:
# 1. Buka table "User"
# 2. Add Record:
#    - email: admin@kos.com
#    - password: [paste hash]
#    - name: Administrator
#    - role: ADMIN
# 3. Save
```

---

## ✅ Selesai! 🎉

Aplikasi Anda sudah LIVE di:
```
https://kos-management-xxx.vercel.app
```

**Login dengan:**
- Email: `admin@kos.com`
- Password: `admin123`

---

## 🔍 Troubleshooting

### ❌ Error: "DATABASE_URL is not defined"
**Solusi:**
```bash
# Check environment variables
vercel env ls

# Jika kosong, add lagi:
vercel env add DATABASE_URL
# Paste connection string
```

### ❌ Error: "Prisma Client not generated"
**Solusi:**
- File `vercel.json` dan `package.json` sudah dikonfigurasi otomatis
- Re-deploy: `vercel --prod`

### ❌ Error: "Authentication failed"
**Solusi:**
1. Pastikan `AUTH_SECRET` sudah di-set
2. Pastikan `AUTH_URL` sama dengan URL production
3. Clear browser cookies
4. Try incognito mode

### ❌ Database Connection Error
**Solusi:**
```bash
# Test connection
npx prisma db pull

# Jika error "SSL required":
# Pastikan connection string ada "?sslmode=require"
```

### ❌ Build Failed
**Solusi:**
1. Check Build Logs di Vercel Dashboard
2. Pastikan semua dependencies ter-install
3. Test build locally:
   ```bash
   npm run build
   ```

---

## 🎯 Next Steps

### Setup Custom Domain (Optional)
1. Vercel Dashboard → **Settings** → **Domains**
2. Add your domain
3. Update DNS records (Vercel will provide instructions)
4. Update `AUTH_URL` to use custom domain

### Enable Analytics
1. Vercel Dashboard → **Analytics**
2. Enable (free for hobby plan)
3. Monitor traffic, performance, errors

### Setup Database Backups
```bash
# Neon.tech provides automatic daily backups
# To restore:
# 1. Go to Neon.tech Dashboard
# 2. Select your project
# 3. Go to "Backups"
# 4. Restore from snapshot
```

### Monitor & Maintain
- **Logs:** Vercel Dashboard → **Deployments** → Select deployment → **Function Logs**
- **Errors:** Enable Vercel Error Tracking
- **Database:** Neon.tech Dashboard → **Monitoring**

---

## 📚 Dokumentasi Lengkap

- **DEPLOYMENT.md**: Panduan detail dengan troubleshooting
- **QUICKSTART.md**: Panduan development local
- **README.md**: Dokumentasi project

---

## 🆘 Need Help?

### Common Issues:
1. ✅ **Invoice tidak muncul?** → Check database migration
2. ✅ **Login gagal?** → Verify admin user created
3. ✅ **Print invoice error?** → Clear browser cache
4. ✅ **Upload gambar error?** → Configure Cloudinary

### Commands Reference:
```bash
# Redeploy
vercel --prod

# View logs
vercel logs

# Open dashboard
vercel

# Pull latest env
vercel env pull
```

---

## 🎊 Congratulations!

Aplikasi Kos Management System Anda sudah LIVE! 🚀

**Features:**
- ✅ Dashboard analytics
- ✅ Manajemen penyewa & kamar
- ✅ Pembayaran & invoice
- ✅ Laporan keuangan
- ✅ Professional invoice print (1 halaman)
- ✅ Authentication & authorization

**Start using:**
1. Login sebagai admin
2. Create kamar-kamar
3. Add penyewa
4. Record pembayaran
5. Print invoice

**Enjoy!** 🎉
