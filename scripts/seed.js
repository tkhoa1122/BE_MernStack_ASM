require('dotenv').config();
const mongoose = require('mongoose');
const Members = require('../models/Member');
const Brand = require('../models/Brand');
const Perfume = require('../models/Perfume');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/as1';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected for seeding');

  // Seed admin and user accounts
  const adminEmail = 'admin@myteam.com';
  const userEmail = 'user@myteam.com';

  const [admin, user] = await Promise.all([
    Members.findOne({ email: adminEmail }),
    Members.findOne({ email: userEmail }),
  ]);

  if (!admin) {
    await Members.create({
      email: adminEmail,
      password: 'Admin123!@#',
      name: 'Admin Account',
      YOB: 1990,
      gender: true,
      isAdmin: true,
    });
    console.log('Created admin:', adminEmail);
  } else {
    console.log('Admin exists:', adminEmail);
  }

  if (!user) {
    await Members.create({
      email: userEmail,
      password: 'User123!@#',
      name: 'Regular User',
      YOB: 2000,
      gender: false,
      isAdmin: false,
    });
    console.log('Created user:', userEmail);
  } else {
    console.log('User exists:', userEmail);
  }

  // Seed multiple brands
  const brandNames = ['Sample Brand', 'Aqua Dior', 'Amber House', 'Cedar Lab'];
  const brandDocs = await Promise.all(
    brandNames.map(async (bn) => {
      let b = await Brand.findOne({ brandName: bn });
      if (!b) b = await Brand.create({ brandName: bn });
      return b;
    })
  );
  const brandMap = Object.fromEntries(brandDocs.map((b) => [b.brandName, b]));

  // Seed 5 real-looking perfumes (with real image links)
  const perfumesData = [
    {
      perfumeName: 'Ocean Mist',
      uri: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1000&q=80',
      price: 98,
      concentration: 'EDT',
      description: 'Fresh aquatic notes with citrus and sea salt for a breezy everyday wear.',
      ingredients: 'Bergamot, Sea Salt, Musk',
      volume: 50,
      targetAudience: 'unisex',
      brand: brandMap['Aqua Dior']._id,
    },
    {
      perfumeName: 'Midnight Amber',
      uri: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1000&q=80',
      price: 135,
      concentration: 'EDP',
      description: 'Warm and resinous amber wrapped with vanilla and smoky woods.',
      ingredients: 'Amber, Vanilla, Guaiac Wood',
      volume: 75,
      targetAudience: 'unisex',
      brand: brandMap['Amber House']._id,
    },
    {
      perfumeName: 'Cedar Trail',
      uri: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80',
      price: 110,
      concentration: 'EDP',
      description: 'Dry cedar and aromatic herbs with a clean, outdoorsy vibe.',
      ingredients: 'Cedar, Sage, Vetiver',
      volume: 100,
      targetAudience: 'male',
      brand: brandMap['Cedar Lab']._id,
    },
    {
      perfumeName: 'Rose Noir',
      uri: 'https://images.unsplash.com/photo-1520975928316-56f0b4a53432?auto=format&fit=crop&w=1000&q=80',
      price: 150,
      concentration: 'Extrait',
      description: 'Dark rose with patchouli and blackcurrant. Bold and sensual.',
      ingredients: 'Rose, Patchouli, Blackcurrant',
      volume: 50,
      targetAudience: 'female',
      brand: brandMap['Sample Brand']._id,
    },
    {
      perfumeName: 'Citrus Bloom',
      uri: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1000&q=80',
      price: 89,
      concentration: 'EDT',
      description: 'Sparkling citrus over soft white florals for a bright start to the day.',
      ingredients: 'Grapefruit, Neroli, Musk',
      volume: 50,
      targetAudience: 'unisex',
      brand: brandMap['Aqua Dior']._id,
    },
  ];

  for (const data of perfumesData) {
    const exists = await Perfume.findOne({ perfumeName: data.perfumeName });
    if (!exists) {
      await Perfume.create(data);
      console.log('Created perfume:', data.perfumeName);
    } else {
      console.log('Perfume exists:', data.perfumeName);
    }
  }

  await mongoose.disconnect();
  console.log('Done seeding');
}

run().catch((e) => { console.error(e); process.exit(1); });
