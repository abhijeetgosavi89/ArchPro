
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create Admin User
  const adminEmail = 'admin@archpro.com'
  const hashedPassword = await bcrypt.hash('password123', 10)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log({ admin })

  // 2. Create Plans
  const plans = [
    {
      planNumber: '5001-MOD',
      title: 'Modern Farmhouse Retreat',
      description: 'A stunning modern farmhouse with open concept living and a large wrap-around porch.',
      width: 60.5,
      depth: 45.0,
      height: 28.0,
      sqFt: 2450,
      beds: 4,
      baths: 3.5,
      stories: 2,
      garage: 2,
      price: 1200.00,
      isTrending: true,
      style: 'Farmhouse',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2670', isPrimary: true, type: 'IMAGE' },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2670', isPrimary: false, type: 'IMAGE' }
        ]
      },
      specs: {
        create: [
          { label: 'Roof Pitch', value: '10:12' },
          { label: 'Foundation', value: 'Slab' }
        ]
      }
    },
    {
      planNumber: '6002-CONT',
      title: 'Contemporary Glass Haven',
      description: 'Floor-to-ceiling windows characterize this sleek contemporary design perfect for scenic views.',
      width: 55.0,
      depth: 60.0,
      height: 24.0,
      sqFt: 3200,
      beds: 5,
      baths: 4.0,
      stories: 2,
      garage: 3,
      price: 1800.00,
      isTrending: true,
      style: 'Modern',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1600596542815-6ad4c7213aa5?auto=format&fit=crop&q=80&w=2671', isPrimary: true, type: 'IMAGE' },
          { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2574', isPrimary: false, type: 'IMAGE' }
        ]
      },
      specs: {
        create: [
          { label: 'Roof Pitch', value: 'Flat' },
          { label: 'Foundation', value: 'Basement' }
        ]
      }
    },
    {
      planNumber: '4003-COTT',
      title: 'Cozy Craftsman Cottage',
      description: 'A charming craftsman cottage with detailed woodwork and a cozy fireplace.',
      width: 40.0,
      depth: 38.0,
      height: 22.0,
      sqFt: 1800,
      beds: 3,
      baths: 2.0,
      stories: 1,
      garage: 2,
      price: 950.00,
      isTrending: false,
      style: 'Craftsman',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&q=80&w=2670', isPrimary: true, type: 'IMAGE' },
          { url: 'https://plus.unsplash.com/premium_photo-1661883964999-c1bcb5e6e7c0?auto=format&fit=crop&q=80&w=2070', isPrimary: false, type: 'IMAGE' }
        ]
      },
      specs: {
        create: [
          { label: 'Roof Pitch', value: '8:12' },
          { label: 'Foundation', value: 'Crawlspace' }
        ]
      }
    },
    {
      planNumber: '7004-BARN',
      title: 'Modern Barndominium',
      description: 'Spacious open living with sophisticated industrial touches. The ultimate barndominium.',
      width: 70.0,
      depth: 50.0,
      height: 30.0,
      sqFt: 4000,
      beds: 4,
      baths: 3.5,
      stories: 2,
      garage: 3,
      price: 2200.00,
      isTrending: true,
      style: 'Barndominium',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2670', isPrimary: true, type: 'IMAGE' },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2670', isPrimary: false, type: 'IMAGE' }
        ]
      },
      specs: {
        create: [
          { label: 'Roof Pitch', value: '6:12' },
          { label: 'Construction', value: 'Pole Barn / Frame' }
        ]
      }
    }
  ]

  for (const plan of plans) {
    const existing = await prisma.plan.findUnique({ where: { planNumber: plan.planNumber } })
    if (!existing) {
      await prisma.plan.create({ data: plan })
      console.log(`Created plan: ${plan.title}`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
