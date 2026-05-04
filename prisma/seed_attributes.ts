const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding attributes...');

    const architecturalStyles = [
        'Modern', 'Farmhouse', 'Craftsman', 'Traditional',
        'Contemporary', 'Barndominium', 'Colonial', 'Mediterranean'
    ];

    const foundations = [
        'Slab', 'Crawl Space', 'Basement', 'Walkout Basement'
    ];

    const exteriorWalls = [
        '2x4', '2x6', 'Concrete Block', 'ICF'
    ];

    // 1. Create Categories
    const styleCategory = await prisma.attributeCategory.upsert({
        where: { slug: 'architectural-style' },
        update: {},
        create: { name: 'Architectural Style', slug: 'architectural-style' },
    });

    const foundationCategory = await prisma.attributeCategory.upsert({
        where: { slug: 'foundation' },
        update: {},
        create: { name: 'Foundation', slug: 'foundation' },
    });

    const wallCategory = await prisma.attributeCategory.upsert({
        where: { slug: 'exterior-wall' },
        update: {},
        create: { name: 'Exterior Wall', slug: 'exterior-wall' },
    });

    // 2. Create Values
    for (const style of architecturalStyles) {
        await prisma.attributeValue.create({
            data: { value: style, categoryId: styleCategory.id }
        });
    }

    for (const foundation of foundations) {
        await prisma.attributeValue.create({
            data: { value: foundation, categoryId: foundationCategory.id }
        });
    }

    for (const wall of exteriorWalls) {
        await prisma.attributeValue.create({
            data: { value: wall, categoryId: wallCategory.id }
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
