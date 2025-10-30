/**
 * Test script để demo cascade check middleware
 * Chạy: node test-cascade-check.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('./models/Brand');
const Perfume = require('./models/Perfume');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/as1';

async function testCascadeCheck() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Tạo brand mới
    console.log('📝 Test 1: Tạo brand "TestBrand"...');
    let testBrand = await Brand.findOne({ brandName: 'TestBrand' });
    if (!testBrand) {
      testBrand = await Brand.create({ brandName: 'TestBrand' });
      console.log('✅ Đã tạo TestBrand:', testBrand._id);
    } else {
      console.log('ℹ️  TestBrand đã tồn tại:', testBrand._id);
    }

    // Test 2: Kiểm tra perfume count
    console.log('\n📝 Test 2: Kiểm tra số lượng perfume dùng TestBrand...');
    const perfumeCount = await Perfume.countDocuments({ brand: testBrand._id });
    console.log(`📊 Số lượng perfume: ${perfumeCount}`);

    if (perfumeCount > 0) {
      console.log('❌ Không thể xóa TestBrand vì còn perfume đang dùng');
      console.log(`   → Cần xóa ${perfumeCount} perfume trước`);
      
      // Liệt kê các perfume
      const perfumes = await Perfume.find({ brand: testBrand._id }).select('perfumeName');
      console.log('\n📋 Danh sách perfume:');
      perfumes.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.perfumeName} (${p._id})`);
      });
    } else {
      console.log('✅ TestBrand không có perfume nào, có thể xóa');
      
      // Thử xóa
      console.log('\n🗑️  Đang xóa TestBrand...');
      await Brand.findByIdAndDelete(testBrand._id);
      console.log('✅ Đã xóa thành công!');
    }

    // Test 3: Demo với brand có perfume
    console.log('\n📝 Test 3: Kiểm tra brand có perfume...');
    const brandsWithPerfumes = await Brand.aggregate([
      {
        $lookup: {
          from: 'perfumes',
          localField: '_id',
          foreignField: 'brand',
          as: 'perfumes'
        }
      },
      {
        $project: {
          brandName: 1,
          perfumeCount: { $size: '$perfumes' }
        }
      },
      { $match: { perfumeCount: { $gt: 0 } } },
      { $limit: 3 }
    ]);

    if (brandsWithPerfumes.length > 0) {
      console.log('\n📋 Các brand KHÔNG THỂ xóa (có perfume):');
      brandsWithPerfumes.forEach(b => {
        console.log(`   ❌ ${b.brandName}: ${b.perfumeCount} sản phẩm`);
      });
    }

    // Test 4: Tìm brand có thể xóa
    console.log('\n📝 Test 4: Tìm brand có thể xóa (không có perfume)...');
    const allBrands = await Brand.find();
    const deletableBrands = [];

    for (const brand of allBrands) {
      const count = await Perfume.countDocuments({ brand: brand._id });
      if (count === 0) {
        deletableBrands.push(brand);
      }
    }

    if (deletableBrands.length > 0) {
      console.log(`\n✅ Tìm thấy ${deletableBrands.length} brand có thể xóa:`);
      deletableBrands.forEach(b => {
        console.log(`   ✓ ${b.brandName} (${b._id})`);
      });
    } else {
      console.log('\nℹ️  Không có brand nào có thể xóa (tất cả đều có perfume)');
    }

    console.log('\n✅ Test hoàn thành!');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy test
console.log('🚀 Bắt đầu test cascade check middleware...\n');
testCascadeCheck();
