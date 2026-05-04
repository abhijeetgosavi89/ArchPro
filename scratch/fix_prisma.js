const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function walkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) walkDir(full);
    else if (f.name.endsWith('.ts') || f.name.endsWith('.tsx')) processFile(full);
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const hasPrismaClient = content.includes("from '@prisma/client'") && content.includes('new PrismaClient()');
  if (!hasPrismaClient) return;

  // Remove the old import line (handle cases where other things like Prisma are also imported)
  content = content.replace(/import \{ PrismaClient \} from '@prisma\/client';\r?\n/g, '');
  content = content.replace(/import \{ PrismaClient, ([^}]+)\} from '@prisma\/client';\r?\n/g, (match, rest) => {
    return `import { ${rest.trim()} } from '@prisma/client';\n`;
  });
  
  // Remove the const prisma = new PrismaClient() line
  content = content.replace(/const prisma = new PrismaClient\(\);\r?\n/g, '');
  content = content.replace(/const prisma = new PrismaClient\(\);\n/g, '');

  // Add the singleton import if prisma is still used and not already imported
  if (content.includes('prisma.') && !content.includes("from '@/lib/prisma'")) {
    content = `import { prisma } from '@/lib/prisma';\n` + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', path.relative(srcDir, filePath));
}

walkDir(srcDir);
console.log('Done!');
