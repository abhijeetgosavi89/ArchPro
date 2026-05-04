
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@archpro.com';
    const password = 'password123';

    console.log(`Updating password for ${email}...`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log(`Success! Password updated for user: ${user.name} (${user.email})`);
        console.log(`New hashed password: ${hashedPassword}`);
    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
