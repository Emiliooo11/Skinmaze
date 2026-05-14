import { PrismaClient, Skin } from '@prisma/client'

const prisma = new PrismaClient()

const skins = [
  // Covert (rarest)
  {
    marketHashName: 'AK-47 | Asiimov (Field-Tested)',
    weapon: 'AK-47',
    skinName: 'Asiimov',
    rarity: 'COVERT',
    wear: 'FIELD_TESTED',
    floatValue: 0.28,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 85.00,
    finalPrice: 89.00,
    liquidityScore: 0.95,
  },
  {
    marketHashName: 'M4A4 | Howl (Field-Tested)',
    weapon: 'M4A4',
    skinName: 'Howl',
    rarity: 'CONTRABAND',
    wear: 'FIELD_TESTED',
    floatValue: 0.22,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 2800.00,
    finalPrice: 2950.00,
    liquidityScore: 0.60,
  },
  // Classified
  {
    marketHashName: 'AWP | Asiimov (Field-Tested)',
    weapon: 'AWP',
    skinName: 'Asiimov',
    rarity: 'CLASSIFIED',
    wear: 'FIELD_TESTED',
    floatValue: 0.31,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 55.00,
    finalPrice: 58.00,
    liquidityScore: 0.92,
  },
  {
    marketHashName: 'USP-S | Kill Confirmed (Minimal Wear)',
    weapon: 'USP-S',
    skinName: 'Kill Confirmed',
    rarity: 'CLASSIFIED',
    wear: 'MINIMAL_WEAR',
    floatValue: 0.09,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 42.00,
    finalPrice: 44.00,
    liquidityScore: 0.88,
  },
  // Restricted
  {
    marketHashName: 'AK-47 | Neon Rider (Minimal Wear)',
    weapon: 'AK-47',
    skinName: 'Neon Rider',
    rarity: 'RESTRICTED',
    wear: 'MINIMAL_WEAR',
    floatValue: 0.12,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 22.00,
    finalPrice: 23.50,
    liquidityScore: 0.85,
  },
  {
    marketHashName: 'Glock-18 | Fade (Factory New)',
    weapon: 'Glock-18',
    skinName: 'Fade',
    rarity: 'RESTRICTED',
    wear: 'FACTORY_NEW',
    floatValue: 0.01,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 185.00,
    finalPrice: 195.00,
    liquidityScore: 0.80,
  },
  // Mil-Spec
  {
    marketHashName: 'AK-47 | Redline (Field-Tested)',
    weapon: 'AK-47',
    skinName: 'Redline',
    rarity: 'MILSPEC',
    wear: 'FIELD_TESTED',
    floatValue: 0.25,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 8.50,
    finalPrice: 9.00,
    liquidityScore: 0.97,
  },
  {
    marketHashName: 'M4A1-S | Decimator (Field-Tested)',
    weapon: 'M4A1-S',
    skinName: 'Decimator',
    rarity: 'MILSPEC',
    wear: 'FIELD_TESTED',
    floatValue: 0.20,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 5.50,
    finalPrice: 5.80,
    liquidityScore: 0.93,
  },
  {
    marketHashName: 'Desert Eagle | Conspiracy (Field-Tested)',
    weapon: 'Desert Eagle',
    skinName: 'Conspiracy',
    rarity: 'MILSPEC',
    wear: 'FIELD_TESTED',
    floatValue: 0.26,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 4.20,
    finalPrice: 4.50,
    liquidityScore: 0.90,
  },
  // Industrial Grade
  {
    marketHashName: 'P250 | Mehndi (Factory New)',
    weapon: 'P250',
    skinName: 'Mehndi',
    rarity: 'INDUSTRIAL',
    wear: 'FACTORY_NEW',
    floatValue: 0.03,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 1.80,
    finalPrice: 1.90,
    liquidityScore: 0.80,
  },
  {
    marketHashName: 'Nova | Candy Apple (Factory New)',
    weapon: 'Nova',
    skinName: 'Candy Apple',
    rarity: 'INDUSTRIAL',
    wear: 'FACTORY_NEW',
    floatValue: 0.02,
    iconUrl: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
    steamPrice: 1.20,
    finalPrice: 1.30,
    liquidityScore: 0.75,
  },
]

// Probability weights designed to hit ~7% house edge on a $10 case
// Total expected value = $9.30
const caseItems = [
  // Covert - 0.64% chance each
  { skinIndex: 0, weight: 64, rarityTier: 'COVERT' },    // AK Asiimov FT ~$89
  // Contraband - 0.01% chance (ultra rare)
  { skinIndex: 1, weight: 1, rarityTier: 'CONTRABAND' }, // M4A4 Howl ~$2950
  // Classified - 3.2% chance each
  { skinIndex: 2, weight: 320, rarityTier: 'CLASSIFIED' }, // AWP Asiimov FT ~$58
  { skinIndex: 3, weight: 320, rarityTier: 'CLASSIFIED' }, // USP Kill Confirmed ~$44
  // Restricted - 6.4% chance each
  { skinIndex: 4, weight: 640, rarityTier: 'RESTRICTED' }, // AK Neon Rider ~$23.50
  { skinIndex: 5, weight: 640, rarityTier: 'RESTRICTED' }, // Glock Fade ~$195
  // Mil-Spec - 25.5% chance each
  { skinIndex: 6, weight: 2550, rarityTier: 'MILSPEC' },   // AK Redline ~$9
  { skinIndex: 7, weight: 2550, rarityTier: 'MILSPEC' },   // M4A1 Decimator ~$5.80
  { skinIndex: 8, weight: 2550, rarityTier: 'MILSPEC' },   // Deagle Conspiracy ~$4.50
  // Industrial - 29.95% chance each
  { skinIndex: 9, weight: 2995, rarityTier: 'INDUSTRIAL' },  // P250 Mehndi ~$1.90
  { skinIndex: 10, weight: 2995, rarityTier: 'INDUSTRIAL' }, // Nova Candy Apple ~$1.30
]

async function main() {
  console.log('Seeding Skinmaze database...')

  // Create skins
  const createdSkins: Skin[] = []
  for (const skin of skins) {
    const created = await prisma.skin.upsert({
      where: { marketHashName: skin.marketHashName },
      update: skin,
      create: skin,
    })
    createdSkins.push(created)
    console.log(`  ✓ Skin: ${created.marketHashName}`)
  }

  // Create test case
  const existingCase = await prisma.case.findFirst({ where: { name: 'Maze Case' } })
  if (existingCase) {
    await prisma.caseItem.deleteMany({ where: { caseId: existingCase.id } })
    await prisma.case.delete({ where: { id: existingCase.id } })
  }

  const totalWeight = caseItems.reduce((sum, i) => sum + i.weight, 0)

  const mazeCase = await prisma.case.create({
    data: {
      name: 'Maze Case',
      image: 'https://community.cloudflare.steamstatic.com/economy/image/class/730/310777493/200fx125f',
      price: 10.00,
      houseEdge: 0.07,
      active: true,
      featured: true,
      items: {
        create: caseItems.map((item) => ({
          skinId: createdSkins[item.skinIndex].id,
          probabilityWeight: item.weight,
          displayedOdds: parseFloat(((item.weight / totalWeight) * 100).toFixed(4)),
          rarityTier: item.rarityTier,
        })),
      },
    },
    include: { items: true },
  })

  console.log(`  ✓ Case: ${mazeCase.name} ($${mazeCase.price}) — ${mazeCase.items.length} items`)
  console.log(`  ✓ Total weight: ${totalWeight}`)

  // Create a test user with balance for development
  const testUser = await prisma.user.upsert({
    where: { steamId: '76561198000000001' },
    update: {},
    create: {
      steamId: '76561198000000001',
      username: 'TestUser',
      avatar: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
      profileUrl: 'https://steamcommunity.com/id/testuser',
      balance: 500.00,
      xp: 1500,
      level: 5,
      role: 'ADMIN',
    },
  })

  console.log(`  ✓ Test user: ${testUser.username} (balance: $${testUser.balance})`)
  console.log('\nSeed complete.')
  console.log('\n--- Development Info ---')
  console.log(`Case ID: ${mazeCase.id}`)
  console.log(`Test User ID: ${testUser.id}`)
  console.log(`Test User Steam ID: ${testUser.steamId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
