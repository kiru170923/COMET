# 🔧 Integration Guide - Multi-Reward System

Hướng dẫn chi tiết để tích hợp hệ thống phần thưởng đa loại vào trang web của bạn.

---

## 1️⃣ Chuẩn Bị Database

### Bước 1: Tạo Bảng Mới Trên Supabase

Đăng nhập vào Supabase > SQL Editor > Chạy đoạn SQL dưới đây:

```sql
-- Tạo bảng reward_requests
CREATE TABLE reward_requests (
  id BIGSERIAL PRIMARY KEY,
  reward_type TEXT NOT NULL,
  selected_option TEXT,
  reward_details TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Tạo index để tối ưu tìm kiếm
CREATE INDEX idx_reward_requests_status ON reward_requests(status);
CREATE INDEX idx_reward_requests_reward_type ON reward_requests(reward_type);
CREATE INDEX idx_reward_requests_created_at ON reward_requests(created_at);

-- Bật Row Level Security
ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;

-- Cho phép insert từ anonymous users
CREATE POLICY "Enable insert for all users" ON reward_requests
  FOR INSERT TO anon
  WITH CHECK (true);

-- Cho phép select cho authenticated users (admin)
CREATE POLICY "Enable read for authenticated users only" ON reward_requests
  FOR SELECT TO authenticated
  USING (true);
```

---

## 2️⃣ Cập Nhật HTML File

### Thêm Script Reference cho Reward Manager

Trong file `en/index.html` và `vi/index.html`, thêm dòng này trước `script.js`:

```html
<!-- Trước khi close </head> tag -->
<script src="reward-manager.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="script.js"></script>
```

### Thêm Reward Selection UI

Bạn cần thêm một bước mới hoặc phần để người dùng chọn loại phần thưởng. 

**Option 1: Thêm Step mới (Được khuyến nghị)**

```html
<!-- Thêm sau Step 1: Introduction -->
<!-- Step 1.5: Select Reward Type -->
<div class="step-container" data-step="1.5">
    <div class="card">
        <div class="card-header">
            <h2>🎁 Chọn phần thưởng</h2>
        </div>
        <div class="card-body">
            <p>Vui lòng chọn loại phần thưởng bạn muốn nhận:</p>
            
            <div class="reward-options">
                <!-- Rewards sẽ được generate bằng JavaScript -->
                <div id="rewardOptionsContainer"></div>
            </div>
        </div>
        <div class="card-footer">
            <button class="btn btn-secondary" onclick="previousStep()">← Quay lại</button>
            <button class="btn btn-primary" id="selectRewardBtn" onclick="confirmRewardSelection()" disabled>
                Tiếp tục →
            </button>
        </div>
    </div>
</div>
```

**Option 2: Thêm trong Step 3 (Form)**

```html
<div class="form-group">
    <label for="rewardType" class="form-label">Chọn Phần Thưởng *</label>
    <select id="rewardType" class="form-input" onchange="updateFormFields()">
        <option value="">-- Chọn phần thưởng --</option>
        <!-- Options sẽ được thêm bằng JavaScript -->
    </select>
    <span class="form-hint">Chọn loại phần thưởng bạn muốn nhận</span>
</div>

<div id="dynamicFormFields">
    <!-- Form fields sẽ được generate động -->
</div>
```

---

## 3️⃣ Cập Nhật JavaScript (script.js)

### Thêm Global Variable

```javascript
let currentRewardType = null;
let currentStep = 1;

// ... existing code ...
```

### Thêm Hàm Xử Lý Reward Selection

```javascript
// Initialize reward options on page load
function initializeRewardSelection() {
    const currentLanguage = detectLanguage(); // 'vi' hoặc 'en'
    const visibleRewards = getVisibleRewardTypes(currentLanguage);
    
    // Populate reward selection
    const container = document.getElementById('rewardOptionsContainer');
    if (container) {
        container.innerHTML = '';
        visibleRewards.forEach(reward => {
            const div = document.createElement('div');
            div.className = 'reward-option';
            div.innerHTML = `
                <input type="radio" name="rewardType" value="${reward.type}" 
                       id="reward_${reward.type}" onchange="updateSelectedReward('${reward.type}')">
                <label for="reward_${reward.type}">
                    <strong>${reward.label}</strong>
                    <p>${reward.description}</p>
                </label>
            `;
            container.appendChild(div);
        });
    }
}

// Update selected reward
function updateSelectedReward(rewardType) {
    currentRewardType = rewardType;
    const selectBtn = document.getElementById('selectRewardBtn');
    if (selectBtn) {
        selectBtn.disabled = false;
    }
}

// Confirm reward selection
function confirmRewardSelection() {
    if (!currentRewardType) {
        showNotification('Vui lòng chọn một phần thưởng!', 'error');
        return;
    }
    
    // Move to instructions or form step
    nextStep();
}

// Detect current language
function detectLanguage() {
    // Check if on Vietnamese or English page
    const path = window.location.pathname;
    if (path.includes('/en/')) return 'en';
    if (path.includes('/vi/')) return 'vi';
    return 'vi'; // Default
}

// Update form fields dynamically based on selected reward
function updateFormFields() {
    const rewardType = document.getElementById('rewardType')?.value;
    if (!rewardType) return;
    
    currentRewardType = rewardType;
    const config = REWARD_CONFIGS[rewardType];
    const container = document.getElementById('dynamicFormFields');
    
    if (!container || !config) return;
    
    container.innerHTML = '';
    config.fields.forEach(field => {
        const fieldHTML = `
            <div class="form-group">
                <label for="${field.id}" class="form-label">${field.label}</label>
                <input 
                    type="${field.type}" 
                    id="${field.id}" 
                    class="form-input" 
                    placeholder="${field.placeholder}"
                    ${field.required ? 'required' : ''}
                >
                <span class="form-hint">${field.label}</span>
            </div>
        `;
        container.innerHTML += fieldHTML;
    });
}
```

### Cập Nhật Function `submitForm()`

```javascript
async function submitForm() {
    // Validate reward selection
    if (!currentRewardType) {
        showNotification('Vui lòng chọn một phần thưởng!', 'error');
        return;
    }

    // Get form values dynamically based on reward type
    const config = REWARD_CONFIGS[currentRewardType];
    const formData = {};
    
    config.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            formData[field.id] = element.value;
        }
    });

    // Validate form
    const validation = validateRewardForm(currentRewardType, formData);
    if (!validation.valid) {
        showNotification(validation.error, 'error');
        return;
    }

    // Build reward details
    let rewardDetails;
    try {
        rewardDetails = buildRewardDetails(currentRewardType, formData);
    } catch (error) {
        showNotification('Lỗi xử lý dữ liệu: ' + error.message, 'error');
        return;
    }

    // Show loading
    showLoading(true);

    try {
        // Save to Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('reward_requests')  // CHANGED FROM 'gemini_requests'
                .insert([
                    {
                        reward_type: currentRewardType,
                        reward_details: rewardDetails,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.error('Supabase error:', error);
                throw new Error('Không thể lưu thông tin. Vui lòng thử lại!');
            }

            console.log('Data saved successfully:', data);
        } else {
            // Fallback for development
            console.log('Form submitted:', {
                reward_type: currentRewardType,
                reward_details: rewardDetails,
                created_at: new Date().toISOString()
            });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Hide loading
        showLoading(false);

        // Show success message
        showNotification('Đã gửi thông tin thành công!', 'success');

        // Move to next step
        setTimeout(() => {
            nextStep();
        }, 1000);

    } catch (error) {
        showLoading(false);
        showNotification(error.message || 'Có lỗi xảy ra. Vui lòng thử lại!', 'error');
        console.error('Error:', error);
    }
}
```

### Cập Nhật `resetForm()` Function

```javascript
function resetForm() {
    // Reset form fields
    const form = document.getElementById('userForm');
    if (form) {
        form.reset();
    }

    // Reset reward selection
    const rewardOptions = document.querySelectorAll('input[name="rewardType"]');
    rewardOptions.forEach(option => {
        option.checked = false;
    });

    // Reset variables
    currentRewardType = null;
    currentStep = 1;
    
    // Show first step
    showStep(1);

    // Disable buttons
    const continueBtn = document.getElementById('continueBtn');
    const selectRewardBtn = document.getElementById('selectRewardBtn');
    if (continueBtn) continueBtn.disabled = true;
    if (selectRewardBtn) selectRewardBtn.disabled = true;
}
```

### Cập Nhật `initializeApp()` Function

```javascript
function initializeApp() {
    // Check if Supabase is configured
    if (!supabase) {
        console.warn('Supabase is not configured. Please update config.js');
    }

    // Setup event listeners
    setupEventListeners();
    
    // Initialize reward selection
    initializeRewardSelection();
    
    // Show first step
    showStep(1);
}
```

---

## 4️⃣ Thêm CSS Styling (Tuỳ Chọn)

Thêm styling cho reward selection options trong `styles.css`:

```css
.reward-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    margin: 20px 0;
}

.reward-option {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
    border: 3px solid #1A1A1A;
    background: #FFF;
    cursor: pointer;
    transition: all 0.2s;
}

.reward-option:hover {
    background: #F0F0F0;
    transform: translate(2px, 2px);
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.reward-option input[type="radio"] {
    margin-top: 5px;
}

.reward-option label {
    flex: 1;
    cursor: pointer;
}

.reward-option label strong {
    display: block;
    margin-bottom: 5px;
    font-size: 1.1rem;
}

.reward-option label p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
}

#dynamicFormFields {
    margin-top: 20px;
}
```

---

## 5️⃣ Testing Checklist

- [ ] Database table `reward_requests` created successfully
- [ ] reward-manager.js loaded without errors
- [ ] Reward options display correctly (4 for VI, 3 for EN)
- [ ] Form fields update based on reward selection
- [ ] All required fields validate correctly
- [ ] Data saves to Supabase in correct JSON format
- [ ] Admin panel can read and display the data
- [ ] Cash reward hidden for English version
- [ ] Success message shows after submission
- [ ] Data structure matches examples in REWARD_SYSTEM_EXAMPLES.json

---

## 6️⃣ Troubleshooting

### Problem: reward-manager.js not loading
**Solution:** Kiểm tra path trong script tag. Đảm bảo file nằm cùng folder với index.html

### Problem: Form fields not updating
**Solution:** Kiểm tra `updateFormFields()` function được gọi khi select reward type

### Problem: Data not saving to Supabase
**Solution:** Kiểm tra:
- Supabase configuration đúng
- Table name là `reward_requests` (không phải `gemini_requests`)
- RLS policies được tạo đúng

### Problem: Cash reward showing on English version
**Solution:** Kiểm tra `getVisibleRewardTypes()` function có filter `hideForLanguage: ['en']`

---

## 7️⃣ Example Data Format

Khi save vào database, dữ liệu sẽ trông như vậy:

```javascript
// Row in database
{
  id: 1,
  reward_type: "gemini",
  selected_option: null,
  reward_details: '{"email":"user@gmail.com","password":"pass123","contact_email":"contact@gmail.com"}',
  status: "pending",
  created_at: "2025-01-15T10:30:00.000Z",
  updated_at: null
}

// Parse in admin:
const details = JSON.parse(row.reward_details);
// {email: "user@gmail.com", password: "pass123", contact_email: "contact@gmail.com"}
```

---

## 📞 Need Help?

Nếu có bất kỳ vấn đề nào, hãy kiểm tra:
1. REWARD_SYSTEM_SETUP.md - Tổng quan hệ thống
2. REWARD_SYSTEM_EXAMPLES.json - Ví dụ dữ liệu
3. reward-manager.js - Các hàm utilities
4. Console browser (F12) - Xem error messages
