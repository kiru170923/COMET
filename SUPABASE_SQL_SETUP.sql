-- ============================================================
-- MULTI-REWARD SYSTEM - DATABASE SETUP FOR SUPABASE
-- ============================================================
-- Chạy tất cả các câu lệnh SQL này trên Supabase SQL Editor
-- RUN ALL THESE SQL COMMANDS ON SUPABASE SQL EDITOR
-- ============================================================

-- Step 1: Create the main rewards table
-- Bước 1: Tạo bảng reward_requests chính
CREATE TABLE IF NOT EXISTS reward_requests (
  id BIGSERIAL PRIMARY KEY,
  reward_type TEXT NOT NULL,
  selected_option TEXT,
  reward_details TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Step 2: Add comments to table columns (for documentation)
-- Bước 2: Thêm chú thích cho các cột
COMMENT ON TABLE reward_requests IS 'Multi-reward system requests table - Stores all reward types (gemini, cash, chatgpt, expressvpn)';
COMMENT ON COLUMN reward_requests.id IS 'Unique request ID';
COMMENT ON COLUMN reward_requests.reward_type IS 'Type of reward: gemini, cash, chatgpt, or expressvpn';
COMMENT ON COLUMN reward_requests.selected_option IS 'Optional: Additional selection option';
COMMENT ON COLUMN reward_requests.reward_details IS 'JSON string containing all reward-specific information';
COMMENT ON COLUMN reward_requests.status IS 'Status: pending, approved, rejected, or completed';
COMMENT ON COLUMN reward_requests.created_at IS 'Timestamp when request was created';
COMMENT ON COLUMN reward_requests.updated_at IS 'Timestamp when request was last updated';

-- Step 3: Create indexes for better performance
-- Bước 3: Tạo indexes để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_reward_requests_status ON reward_requests(status);
CREATE INDEX IF NOT EXISTS idx_reward_requests_reward_type ON reward_requests(reward_type);
CREATE INDEX IF NOT EXISTS idx_reward_requests_created_at ON reward_requests(created_at);

-- Step 4: Enable Row Level Security
-- Bước 4: Bật Row Level Security
ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policy for INSERT operations (allow all anonymous users)
-- Bước 5: Tạo policy cho INSERT (cho phép tất cả anonymous users)
CREATE POLICY IF NOT EXISTS "Enable insert for all users" ON reward_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Step 6: Create policy for SELECT operations (only authenticated users - admin)
-- Bước 6: Tạo policy cho SELECT (chỉ authenticated users - admin)
CREATE POLICY IF NOT EXISTS "Enable read for authenticated users only" ON reward_requests
  FOR SELECT TO authenticated
  USING (true);

-- Step 7: Create policy for UPDATE operations (only authenticated users - admin)
-- Bước 7: Tạo policy cho UPDATE (chỉ authenticated users - admin)
CREATE POLICY IF NOT EXISTS "Enable update for authenticated users only" ON reward_requests
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 8: Create policy for DELETE operations (only authenticated users - admin)
-- Bước 8: Tạo policy cho DELETE (chỉ authenticated users - admin)
CREATE POLICY IF NOT EXISTS "Enable delete for authenticated users only" ON reward_requests
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- SUCCESS! Table is now ready to use
-- THÀNH CÔNG! Bảng đã sẵn sàng để sử dụng
-- ============================================================

-- VERIFICATION QUERIES (optional - to check if table is created)
-- Các câu truy vấn kiểm tra (tuỳ chọn - để kiểm tra nếu bảng được tạo)

-- List all tables
-- Danh sách tất cả bảng
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check reward_requests table structure
-- Kiểm tra cấu trúc bảng reward_requests
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'reward_requests';

-- Check policies on reward_requests
-- Kiểm tra policies trên reward_requests
-- SELECT * FROM pg_policies WHERE tablename = 'reward_requests';

-- Check indexes on reward_requests
-- Kiểm tra indexes trên reward_requests
-- SELECT indexname FROM pg_indexes WHERE tablename = 'reward_requests';
