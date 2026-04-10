import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.sellerApplication.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await prisma.$transaction([
    prisma.category.create({ data: { name: 'Électronique', slug: 'electronique' } }),
    prisma.category.create({ data: { name: 'Maison', slug: 'maison' } }),
    prisma.category.create({ data: { name: 'Mode', slug: 'mode' } }),
    prisma.category.create({ data: { name: 'Beauté', slug: 'beaute' } }),
    prisma.category.create({ data: { name: 'Mobilité', slug: 'mobilite' } })
  ]);

  const map = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const products = [
    ['Smartphone Nova X', 'smartphone-nova-x', 'electronique', 179000, 199000, 35],
    ['Casque Bluetooth Pulse', 'casque-bluetooth-pulse', 'electronique', 25000, 32000, 80],
    ['Blender ProMix', 'blender-promix', 'maison', 39000, 45000, 52],
    ['Lampe Solaire LED', 'lampe-solaire-led', 'maison', 12000, 15000, 120],
    ['Sneakers Urban Flex', 'sneakers-urban-flex', 'mode', 28000, 34000, 41],
    ['Sac à dos Commuter', 'sac-a-dos-commuter', 'mode', 18000, 22000, 65],
    ['Sérum Éclat Naturel', 'serum-eclat-naturel', 'beaute', 9500, 12000, 90],
    ['Kit Barbe Premium', 'kit-barbe-premium', 'beaute', 14500, null, 54],
    ['Trottinette Électrique Go', 'trottinette-electrique-go', 'mobilite', 245000, 279000, 10],
    ['Support Téléphone Voiture', 'support-telephone-voiture', 'mobilite', 8500, 11000, 200],
    ['Powerbank Turbo 20k', 'powerbank-turbo-20k', 'electronique', 19500, 24000, 95]
  ] as const;

  for (const [name, slug, categorySlug, price, oldPrice, stock] of products) {
    await prisma.product.create({
      data: {
        name,
        slug,
        description:
          'Produit sélectionné par Min-shop pour offrir un excellent rapport qualité/prix, idéal pour le quotidien en Afrique.',
        categoryId: map[categorySlug],
        price,
        oldPrice,
        stock,
        featured: Math.random() > 0.6,
        images: [
          `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80`,
          `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80`
        ],
        specs: {
          garantie: '12 mois',
          livraison: '48h à 96h',
          origine: 'Sélection Min-shop'
        }
      }
    });
  }

  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.create({
    data: {
      name: 'Admin Min-shop',
      email: 'admin@min-shop.africa',
      passwordHash,
      role: UserRole.ADMIN
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
