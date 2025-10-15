const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@kos.com' },
    })

    if (existingAdmin) {
      console.log('❌ Admin user already exists!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kos.com',
        name: 'Administrator',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@kos.com')
    console.log('🔑 Password: admin123')
    console.log('\n⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
