-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PENYEWA');

-- CreateEnum
CREATE TYPE "StatusPenyewa" AS ENUM ('AKTIF', 'KELUAR', 'SUSPEND');

-- CreateEnum
CREATE TYPE "TipeKamar" AS ENUM ('STANDAR', 'PREMIUM', 'VIP');

-- CreateEnum
CREATE TYPE "StatusKamar" AS ENUM ('TERSEDIA', 'TERISI', 'MAINTENANCE', 'BOOKING');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('TUNAI', 'TRANSFER', 'EWALLET', 'DEBIT');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('PENDING', 'LUNAS', 'TELAT', 'BATAL');

-- CreateEnum
CREATE TYPE "KategoriPengaduan" AS ENUM ('LISTRIK', 'AIR', 'KAMAR_MANDI', 'FURNITURE', 'AC', 'KEBERSIHAN', 'KEAMANAN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "PrioritasPengaduan" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'DARURAT');

-- CreateEnum
CREATE TYPE "StatusPengaduan" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penyewa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "alamatAsal" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "pekerjaan" TEXT,
    "fotoKtpUrl" TEXT,
    "ktpNumber" TEXT,
    "status" "StatusPenyewa" NOT NULL DEFAULT 'AKTIF',
    "tanggalMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penyewa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kamar" (
    "id" TEXT NOT NULL,
    "nomorKamar" TEXT NOT NULL,
    "lantai" INTEGER NOT NULL,
    "tipe" "TipeKamar" NOT NULL,
    "hargaPerBulan" DECIMAL(10,2) NOT NULL,
    "fasilitas" TEXT[],
    "status" "StatusKamar" NOT NULL DEFAULT 'TERSEDIA',
    "kapasitas" INTEGER NOT NULL DEFAULT 1,
    "luasKamar" DECIMAL(5,2),
    "deskripsi" TEXT,
    "fotoUrl" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "penyewaId" TEXT,

    CONSTRAINT "kamar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "nomorInvoice" TEXT NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bulanPembayaran" TEXT NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "metodePembayaran" "MetodePembayaran" NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'PENDING',
    "keterangan" TEXT,
    "buktiUrl" TEXT,
    "jatuhTempo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "penyewaId" TEXT NOT NULL,
    "kamarId" TEXT NOT NULL,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaduan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" "KategoriPengaduan" NOT NULL,
    "prioritas" "PrioritasPengaduan" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusPengaduan" NOT NULL DEFAULT 'BARU',
    "fotoUrl" TEXT[],
    "tanggapan" TEXT,
    "biayaPerbaikan" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "diselesaikanPada" TIMESTAMP(3),
    "penyewaId" TEXT NOT NULL,

    CONSTRAINT "pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perawatan" (
    "id" TEXT NOT NULL,
    "tanggalPerawatan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jenisPerawatan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "biaya" DECIMAL(10,2) NOT NULL,
    "teknisi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kamarId" TEXT NOT NULL,

    CONSTRAINT "perawatan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "penyewa_email_key" ON "penyewa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kamar_nomorKamar_key" ON "kamar"("nomorKamar");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_nomorInvoice_key" ON "pembayaran"("nomorInvoice");

-- CreateIndex
CREATE INDEX "pembayaran_penyewaId_idx" ON "pembayaran"("penyewaId");

-- CreateIndex
CREATE INDEX "pembayaran_kamarId_idx" ON "pembayaran"("kamarId");

-- CreateIndex
CREATE INDEX "pembayaran_bulanPembayaran_idx" ON "pembayaran"("bulanPembayaran");

-- CreateIndex
CREATE INDEX "pengaduan_penyewaId_idx" ON "pengaduan"("penyewaId");

-- CreateIndex
CREATE INDEX "pengaduan_status_idx" ON "pengaduan"("status");

-- CreateIndex
CREATE INDEX "perawatan_kamarId_idx" ON "perawatan"("kamarId");

-- AddForeignKey
ALTER TABLE "kamar" ADD CONSTRAINT "kamar_penyewaId_fkey" FOREIGN KEY ("penyewaId") REFERENCES "penyewa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_penyewaId_fkey" FOREIGN KEY ("penyewaId") REFERENCES "penyewa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_kamarId_fkey" FOREIGN KEY ("kamarId") REFERENCES "kamar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengaduan" ADD CONSTRAINT "pengaduan_penyewaId_fkey" FOREIGN KEY ("penyewaId") REFERENCES "penyewa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perawatan" ADD CONSTRAINT "perawatan_kamarId_fkey" FOREIGN KEY ("kamarId") REFERENCES "kamar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
