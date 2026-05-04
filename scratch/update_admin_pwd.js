
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function updateAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const admin = await prisma.user.update({
      where: { email: 'admin@archpro.com' },
      data: { password: hashedPassword }
    })
    console.log('Admin password updated successfully with hashed version.')
  } catch (err) {
    console.error('Error updating admin password:', err)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdmin()
