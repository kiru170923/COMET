# 🚀 Quick Start - Multi-Reward System

## ✅ Những Gì Đã Được Chuẩn Bị

Hệ thống đã được thiết kế để hỗ trợ **4 loại phần thưởng** với cơ sở dữ liệu tập trung:

### 📦 Files Được Tạo/Cập Nhật:

1. **config.js** (3 file)
   - `/config.js` - Root config
   - `/en/config.js` - English config
   - `/vi/config.js` - Vietnamese config
   - ✅ Cập nhật hướng dẫn SQL tạo bảng `reward_requests`

2. **reward-manager.js** (2 file) - ✨ MỚI
   - `/en/reward-manager.js` - English utilities
   - `/vi/reward-manager.js` - Vietnamese utilities
   - Chứa các hàm quản lý phần thưởng

3. **Documentation** (4 file) - 📚 MỚI
   - `REWARD_SYSTEM_SETUP.md` - Tổng quan hệ thống
   - `REWARD_SYSTEM_EXAMPLES.json` - Ví dụ dữ liệu
   - `INTEGRATION_GUIDE.md` - Hướng dẫn tích hợp chi tiết
   - `QUICK_START.md` - File này

---

## 🎯 4 Loại Phần Thưởng

```
┌─────────────────────────────────────────────────────────┐
│ 1. GEMINI PRO 1 NĂM                                     │
│    - Hiển thị: VI ✓ EN ✓                                │
│    - Thông tin: Email, Password, Contact Email          │
├─────────────────────────────────────────────────────────┤
│ 2. TIỀN MẶT 50K (cash)                                  │
│    - Hiển thị: VI ✓ EN ✗                                │
│    - Thông tin: Contact Email, Account#, Bank Name      │
├─────────────────────────────────────────────────────────┤
│ 3. CHAT GPT PRO 1 THÁNG                                 │
│    - Hiển thị: VI ✓ EN ✓                                │
│    - Thông tin: Contact Email, ChatGPT Invite Email     │
├─────────────────────────────────────────────────────────┤
│ 4. EXPRESS VPN 1 THÁNG                                  │
│    - Hiển thị: VI ✓ EN ✓                                │
│    - Thông tin: Contact Email                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Cách Sử Dụng reward-manager.js

File này cung cấp 6 hàm quan trọng:

### 1. buildRewardDetails(rewardType, formData)
Chuyển dữ liệu form thành JSON string để lưu vào database
```javascript
const details = buildRewardDetails('gemini', {
    email: 'user@gmail.com',
    password: 'pass123',
    contactEmail: 'contact@gmail.com'
});
// Returns: '{"email":"user@gmail.com","password":"pass123","contact_email":"contact@gmail.com"}'
```

### 2. parseRewardDetails(detailsJson)
Parse JSON string thành object để đọc từ database
```javascript
const details = parseRewardDetails(row.reward_details);
// Returns: {email: "user@gmail.com", password: "pass123", contact_email: "contact@gmail.com"}
```

### 3. validateRewardForm(rewardType, formData)
Kiểm tra dữ liệu form hợp lệ
```javascript
const result = validateRewardForm('cash', formData);
// Returns: { valid: true } hoặc { valid: false, error: "..." }
```

### 4. getVisibleRewardTypes(language)
Lấy các loại phần thưởng hiển thị cho ngôn ngữ cụ thể
```javascript
const rewards = getVisibleRewardTypes('vi');
// Returns: [gemini, cash, chatgpt, expressvpn]

const rewards = getVisibleRewardTypes('en');
// Returns: [gemini, chatgpt, expressvpn]  // cash hidden
```

### 5. isValidEmail(email)
Kiểm tra email hợp lệ
```javascript
isValidEmail('user@gmail.com');  // true
isValidEmail('invalid-email');   // false
```

### 6. formatRewardDisplay(rewardType, detailsJson)
Format dữ liệu để hiển thị trong admin panel
```javascript
const html = formatRewardDisplay('gemini', '{"email":"user@gmail.com",...}');
// Returns: HTML string với dữ liệu được format
```

---

## 📝 Database Structure

### Table: reward_requests

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary Key |
| reward_type | TEXT | 'gemini', 'cash', 'chatgpt', 'expressvpn' |
| selected_option | TEXT | Tuỳ chọn (nullable) |
| reward_details | TEXT | **JSON string** chứa tất cả thông tin |
| status | TEXT | 'pending', 'approved', 'rejected', 'completed' |
| created_at | TIMESTAMPTZ | Thời gian tạo |
| updated_at | TIMESTAMPTZ | Thời gian cập nhật |

### Ví Dụ Dữ Liệu:

```json
{
  "id": 1,
  "reward_type": "gemini",
  "selected_option": null,
  "reward_details": "{\"email\":\"user@gmail.com\",\"password\":\"pass123\",\"contact_email\":\"contact@gmail.com\"}",
  "status": "pending",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

---

## ⏭️ Tiếp Theo - Cần Làm Gì?

### 1. ✅ Cập Nhật Database (Bắt Buộc)

Chạy SQL này trong Supabase SQL Editor:

```sql
CREATE TABLE reward_requests (
  id BIGSERIAL PRIMARY KEY,
  reward_type TEXT NOT NULL,
  selected_option TEXT,
  reward_details TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX idx_reward_requests_status ON reward_requests(status);
CREATE INDEX idx_reward_requests_reward_type ON reward_requests(reward_type);
CREATE INDEX idx_reward_requests_created_at ON reward_requests(created_at);

ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON reward_requests
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users only" ON reward_requests
  FOR SELECT TO authenticated USING (true);
```

### 2. ✅ Cập Nhật HTML (Bắt Buộc)

Thêm vào `en/index.html` và `vi/index.html`:
- Thêm script tag cho `reward-manager.js`
- Thêm UI cho chọn loại phần thưởng (Step mới hoặc trong form)

### 3. ✅ Cập Nhật JavaScript (Bắt Buộc)

Sửa file `en/script.js` và `vi/script.js`:
- Thêm variable: `let currentRewardType = null;`
- Thêm hàm `initializeRewardSelection()`
- Cập nhật `submitForm()` function
- Thay đổi table từ `gemini_requests` → `reward_requests`

### 4. ✅ Cập Nhật Admin Panel (Tuỳ Chọn)

Chỉnh sửa admin.js để:
- Hiển thị `reward_type` column
- Parse JSON từ `reward_details`
- Filter theo reward type
- Hiển thị dữ liệu dễ đọc

---

## 📖 Tài Liệu Tham Khảo

| File | Nội Dung |
|------|---------|
| **REWARD_SYSTEM_SETUP.md** | Tổng quan, database schema, định dạng dữ liệu |
| **REWARD_SYSTEM_EXAMPLES.json** | Ví dụ dữ liệu, SQL queries, ghi chú |
| **INTEGRATION_GUIDE.md** | Hướng dẫn chi tiết từng bước |
| **reward-manager.js** | Các hàm utilities (copy sang cả EN và VI) |

---

## 🔑 Chìa Khóa Quan Trọng

1. **JSON String Storage** 📦
   - Tất cả dữ liệu lưu ở `reward_details` dạng JSON string
   - Dễ mở rộng cho phần thưởng mới
   - Linh hoạt trong số lượng field

2. **Language-Based Visibility** 🌍
   - Cash chỉ hiển thị tiếng Việt
   - Sử dụng `getVisibleRewardTypes(language)`
   - Dễ thêm/bớt ngôn ngữ cho từng reward

3. **Reusable Components** ♻️
   - `reward-manager.js` có thể tái sử dụng
   - Tất cả logic được tập trung trong một file
   - Admin panel có thể tái sử dụng các hàm

4. **Scalable Design** 📈
   - Dễ thêm phần thưởng mới
   - Chỉ cần cập nhật `REWARD_CONFIGS`
   - Database schema không cần thay đổi

---

## ❓ Câu Hỏi Thường Gặp

**Q: Làm sao để thêm phần thưởng mới?**
A: Thêm vào `REWARD_CONFIGS` trong `reward-manager.js`:
```javascript
[REWARD_TYPES.NEW_REWARD]: {
    label: 'New Reward',
    fields: [...],
    hideForLanguage: []
}
```

**Q: Tiền mặt tại sao chỉ hiển thị tiếng Việt?**
A: Dùng `hideForLanguage: ['en']` trong config cash

**Q: Làm sao admin xem dữ liệu?**
A: Dùng `parseRewardDetails()` để parse JSON từ database

**Q: Có thể thêm field khác không?**
A: Có, chỉ cần thêm vào `fields` array trong config

---

## 💾 File Summary

```
📁 PROJECT/
├── 📄 config.js ✅ (Updated)
├── 📁 en/
│   ├── 📄 config.js ✅ (Updated)
│   ├── 📄 index.html ⏳ (Need HTML update)
│   ├── 📄 script.js ⏳ (Need JS update)
│   └── 📄 reward-manager.js ✅ (New)
├── 📁 vi/
│   ├── 📄 config.js ✅ (Updated)
│   ├── 📄 index.html ⏳ (Need HTML update)
│   ├── 📄 script.js ⏳ (Need JS update)
│   └── 📄 reward-manager.js ✅ (New)
├── 📄 REWARD_SYSTEM_SETUP.md ✅ (New)
├── 📄 REWARD_SYSTEM_EXAMPLES.json ✅ (New)
├── 📄 INTEGRATION_GUIDE.md ✅ (New)
└── 📄 QUICK_START.md ✅ (This file)

✅ = Done
⏳ = Need to update
```

---

## 🎯 Next Steps

1. **Bây giờ:** Đọc `INTEGRATION_GUIDE.md` để biết cách cập nhật code
2. **Tiếp theo:** Chạy SQL để tạo table
3. **Rồi đó:** Cập nhật HTML và JavaScript
4. **Cuối cùng:** Test tất cả 4 loại phần thưởng

---

## 📞 Support

Nếu có bất kỳ câu hỏi nào, hãy:
1. Kiểm tra console (F12) xem error message
2. Xem `INTEGRATION_GUIDE.md` mục Troubleshooting
3. Kiểm tra ví dụ dữ liệu trong `REWARD_SYSTEM_EXAMPLES.json`

---

**Chúc bạn thành công! 🎉**
