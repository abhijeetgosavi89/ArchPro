
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@archpro.com' }
  })
  console.log('Admin user found:', admin ? 'Yes' : 'No')
  if (admin) {
    console.log('Role:', admin.role)
    console.log('Password length:', admin.password?.length)
    console.log('Password starts with $2a or $2b (hashed):', admin.password?.startsWith('$2a') || admin.password?.startsWith('$2b'))
  }
}

check()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
