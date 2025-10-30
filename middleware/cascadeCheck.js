const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');

/**
 * Middleware kiểm tra trước khi xóa Brand
 * Không cho xóa Brand nếu còn Perfume đang sử dụng
 */
async function checkBrandBeforeDelete(req, res, next) {
  try {
    const brandId = req.params.brandId || req.params.id;
    
    // Kiểm tra xem brand có tồn tại không
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy thương hiệu này' 
      });
    }

    // Kiểm tra xem có perfume nào đang sử dụng brand này không
    const perfumeCount = await Perfume.countDocuments({ brand: brandId });
    
    if (perfumeCount > 0) {
      // Nếu có perfume đang dùng, không cho xóa
      if (req.accepts('html')) {
        // Trả về HTML với thông báo lỗi
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lỗi xóa thương hiệu</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
              .error-box { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 30px; 
                border: 2px solid #ef4444; 
                border-radius: 10px; 
                background: #fee;
              }
              h1 { color: #dc2626; }
              .btn { 
                display: inline-block; 
                margin-top: 20px; 
                padding: 10px 20px; 
                background: #3b82f6; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="error-box">
              <h1>❌ Không thể xóa thương hiệu</h1>
              <p><strong>${brand.brandName}</strong> đang được sử dụng bởi <strong>${perfumeCount}</strong> sản phẩm.</p>
              <p>Vui lòng xóa hoặc chuyển các sản phẩm sang thương hiệu khác trước khi xóa thương hiệu này.</p>
              <a href="/dashboard/brands" class="btn">Quay lại</a>
            </div>
          </body>
          </html>
        `);
      } else {
        // Trả về JSON
        return res.status(400).json({
          success: false,
          message: `Không thể xóa thương hiệu "${brand.brandName}". Còn ${perfumeCount} sản phẩm đang sử dụng thương hiệu này.`,
          brandName: brand.brandName,
          perfumeCount: perfumeCount,
          code: 'BRAND_IN_USE'
        });
      }
    }

    // Nếu không có perfume nào dùng, cho phép xóa
    req.brandToDelete = brand;
    next();
  } catch (err) {
    console.error('Error in checkBrandBeforeDelete:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi kiểm tra dữ liệu' 
    });
  }
}

/**
 * Middleware kiểm tra trước khi xóa Perfume
 * Xóa tất cả comments trong perfume trước khi xóa
 */
async function checkPerfumeBeforeDelete(req, res, next) {
  try {
    const perfumeId = req.params.perfumeId || req.params.id;
    
    // Kiểm tra xem perfume có tồn tại không
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy sản phẩm này' 
      });
    }

    // Kiểm tra số lượng comments
    const commentCount = perfume.comments ? perfume.comments.length : 0;
    
    if (commentCount > 0) {
      // Cảnh báo nhưng vẫn cho phép xóa (sẽ xóa cả comments)
      console.log(`Warning: Deleting perfume "${perfume.perfumeName}" with ${commentCount} comments`);
    }

    req.perfumeToDelete = perfume;
    next();
  } catch (err) {
    console.error('Error in checkPerfumeBeforeDelete:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi kiểm tra dữ liệu' 
    });
  }
}

/**
 * Middleware kiểm tra trước khi xóa Member
 * Không cho xóa Member nếu họ đã có comments trên các perfume
 */
async function checkMemberBeforeDelete(req, res, next) {
  try {
    const memberId = req.params.memberId || req.params.id;
    
    // Đếm số comments của member này
    const perfumesWithComments = await Perfume.countDocuments({
      'comments.author': memberId
    });
    
    if (perfumesWithComments > 0) {
      if (req.accepts('html')) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Lỗi xóa thành viên</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
              .error-box { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 30px; 
                border: 2px solid #ef4444; 
                border-radius: 10px; 
                background: #fee;
              }
              h1 { color: #dc2626; }
              .btn { 
                display: inline-block; 
                margin-top: 20px; 
                padding: 10px 20px; 
                background: #3b82f6; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="error-box">
              <h1>❌ Không thể xóa thành viên</h1>
              <p>Thành viên này đã có <strong>${perfumesWithComments}</strong> đánh giá trên các sản phẩm.</p>
              <p>Vui lòng xóa các đánh giá trước khi xóa thành viên.</p>
              <a href="/collectors" class="btn">Quay lại</a>
            </div>
          </body>
          </html>
        `);
      } else {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa thành viên. Họ đã có ${perfumesWithComments} đánh giá trên các sản phẩm.`,
          commentCount: perfumesWithComments,
          code: 'MEMBER_HAS_COMMENTS'
        });
      }
    }

    next();
  } catch (err) {
    console.error('Error in checkMemberBeforeDelete:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi kiểm tra dữ liệu' 
    });
  }
}

module.exports = {
  checkBrandBeforeDelete,
  checkPerfumeBeforeDelete,
  checkMemberBeforeDelete
};
