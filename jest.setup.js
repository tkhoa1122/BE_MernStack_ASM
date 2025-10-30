// Thiết lập môi trường test
require('dotenv').config({ path: '.env.test' });

// Có thể thêm các cấu hình global khác
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
