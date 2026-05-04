
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@archpro.com' }
    })
    console.log('Admin user found:', admin ? 'Yes' : 'No')
    if (admin) {
      console.log('Role:', admin.role)
      console.log('Password length:', admin.password ? admin.password.length : 0)
      console.log('Password starts with $2 (hashed):', admin.password ? (admin.password.startsWith('$2a') || admin.password.startsWith('$2b')) : false)
      console.log('Plain text password match "password123":', admin.password === 'password123')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

check()
