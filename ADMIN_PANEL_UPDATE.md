# 📊 Admin Panel Update Guide

Hướng dẫn cập nhật Admin Panel để hoạt động với hệ thống phần thưởng đa loại mới.

---

## 📋 Những Thay Đổi Cần Làm

Admin panel hiện tại chỉ hỗ trợ bảng `gemini_requests`. Cần cập nhật để:

1. ✅ Thay đổi table từ `gemini_requests` → `reward_requests`
2. ✅ Thêm column `reward_type` (loại phần thưởng)
3. ✅ Parse `reward_details` JSON string
4. ✅ Hiển thị dữ liệu động dựa trên loại phần thưởng
5. ✅ Thêm filter theo `reward_type`
6. ✅ Cập nhật form cập nhật để xử lý các loại phần thưởng khác nhau

---

## 🔧 Code Updates

### 1. Cập Nhật Fetching Data

**Trước (Cũ):**
```javascript
async function fetchGeminiRequests() {
    const { data, error } = await supabase
        .from('gemini_requests')
        .select('*')
        .order('created_at', { ascending: false });
    
    return data;
}
```

**Sau (Mới):**
```javascript
async function fetchRewardRequests(rewardType = null) {
    let query = supabase
        .from('reward_requests')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (rewardType) {
        query = query.eq('reward_type', rewardType);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching data:', error);
        return [];
    }
    
    return data;
}
```

### 2. Render Table Dinamis

**HTML Structure:**
```html
<div class="admin-controls">
    <label for="rewardTypeFilter">Filter by Reward Type:</label>
    <select id="rewardTypeFilter" onchange="filterByRewardType()">
        <option value="">All Rewards</option>
        <option value="gemini">GEMINI PRO</option>
        <option value="cash">TIỀN MẶT</option>
        <option value="chatgpt">CHAT GPT PRO</option>
        <option value="expressvpn">EXPRESS VPN</option>
    </select>
</div>

<table id="requestsTable" class="admin-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Reward Type</th>
            <th>Contact Info</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="tableBody">
        <!-- Rows sẽ được generate bằng JavaScript -->
    </tbody>
</table>
```

**JavaScript to Render:**
```javascript
async function renderRewardRequests() {
    const rewardTypeFilter = document.getElementById('rewardTypeFilter').value;
    const data = await fetchRewardRequests(rewardTypeFilter);
    const tbody = document.getElementById('tableBody');
    
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const details = parseRewardDetails(row.reward_details);
        const contactInfo = getContactInfo(row.reward_type, details);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>
                <span class="reward-badge reward-${row.reward_type}">
                    ${getRewardLabel(row.reward_type)}
                </span>
            </td>
            <td>${contactInfo}</td>
            <td>
                <select class="status-select" onchange="updateStatus(${row.id}, this.value)">
                    <option value="pending" ${row.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="approved" ${row.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="rejected" ${row.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="completed" ${row.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>${new Date(row.created_at).toLocaleString()}</td>
            <td>
                <button onclick="viewDetails(${row.id}, '${row.reward_type}', ${JSON.stringify(details).replace(/"/g, '&quot;')})">
                    View
                </button>
                <button onclick="deleteRequest(${row.id})">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getRewardLabel(rewardType) {
    const labels = {
        'gemini': 'GEMINI PRO 1 Year',
        'cash': 'TIỀN MẶT 50K',
        'chatgpt': 'CHAT GPT PRO 1 Month',
        'expressvpn': 'EXPRESS VPN 1 Month'
    };
    return labels[rewardType] || rewardType;
}

function getContactInfo(rewardType, details) {
    switch (rewardType) {
        case 'gemini':
            return `📧 ${details.contact_email || 'N/A'}`;
        case 'cash':
            return `💰 ${details.account_number || 'N/A'} (${details.bank_name || 'N/A'})`;
        case 'chatgpt':
            return `💬 ${details.contact_email || 'N/A'}`;
        case 'expressvpn':
            return `🔐 ${details.contact_email || 'N/A'}`;
        default:
            return 'N/A';
    }
}

function filterByRewardType() {
    renderRewardRequests();
}
```

### 3. View Details Modal

```javascript
function viewDetails(id, rewardType, details) {
    const modal = document.getElementById('detailsModal');
    const contentDiv = document.getElementById('detailsContent');
    
    let html = `
        <h3>Request Details - ID: ${id}</h3>
        <p><strong>Reward Type:</strong> ${getRewardLabel(rewardType)}</p>
    `;
    
    switch (rewardType) {
        case 'gemini':
            html += `
                <p><strong>Google Email:</strong> ${details.email || 'N/A'}</p>
                <p><strong>Password:</strong> <code>${maskPassword(details.password)}</code></p>
                <p><strong>Contact Email:</strong> ${details.contact_email || 'N/A'}</p>
            `;
            break;
        case 'cash':
            html += `
                <p><strong>Contact Email:</strong> ${details.contact_email || 'N/A'}</p>
                <p><strong>Account Number:</strong> <code>${details.account_number || 'N/A'}</code></p>
                <p><strong>Bank Name:</strong> ${details.bank_name || 'N/A'}</p>
            `;
            break;
        case 'chatgpt':
            html += `
                <p><strong>Contact Email:</strong> ${details.contact_email || 'N/A'}</p>
                <p><strong>ChatGPT Invite Email:</strong> ${details.chatgpt_invite_email || 'N/A'}</p>
            `;
            break;
        case 'expressvpn':
            html += `
                <p><strong>Contact Email:</strong> ${details.contact_email || 'N/A'}</p>
            `;
            break;
    }
    
    contentDiv.innerHTML = html;
    modal.style.display = 'block';
}

function maskPassword(password) {
    if (!password) return 'N/A';
    return '•'.repeat(password.length);
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    modal.style.display = 'none';
}
```

### 4. Update Status

```javascript
async function updateStatus(id, status) {
    const { data, error } = await supabase
        .from('reward_requests')
        .update({ 
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);
    
    if (error) {
        alert('Error updating status: ' + error.message);
        return;
    }
    
    renderRewardRequests();
}
```

### 5. Delete Request

```javascript
async function deleteRequest(id) {
    if (!confirm('Are you sure you want to delete this request?')) {
        return;
    }
    
    const { data, error } = await supabase
        .from('reward_requests')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Error deleting request: ' + error.message);
        return;
    }
    
    renderRewardRequests();
}
```

### 6. Statistics Dashboard

```javascript
async function showStatistics() {
    const data = await fetchRewardRequests();
    
    const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        completed: data.filter(r => r.status === 'completed').length,
        byType: {
            gemini: data.filter(r => r.reward_type === 'gemini').length,
            cash: data.filter(r => r.reward_type === 'cash').length,
            chatgpt: data.filter(r => r.reward_type === 'chatgpt').length,
            expressvpn: data.filter(r => r.reward_type === 'expressvpn').length
        }
    };
    
    const statsDiv = document.getElementById('statsDiv');
    statsDiv.innerHTML = `
        <div class="stats-container">
            <div class="stat-box">
                <h4>Total Requests</h4>
                <p class="stat-number">${stats.total}</p>
            </div>
            <div class="stat-box">
                <h4>Pending</h4>
                <p class="stat-number warning">${stats.pending}</p>
            </div>
            <div class="stat-box">
                <h4>Approved</h4>
                <p class="stat-number success">${stats.approved}</p>
            </div>
            <div class="stat-box">
                <h4>Completed</h4>
                <p class="stat-number success">${stats.completed}</p>
            </div>
            <div class="stat-box">
                <h4>GEMINI</h4>
                <p class="stat-number">${stats.byType.gemini}</p>
            </div>
            <div class="stat-box">
                <h4>TIỀN MẶT</h4>
                <p class="stat-number">${stats.byType.cash}</p>
            </div>
            <div class="stat-box">
                <h4>CHAT GPT</h4>
                <p class="stat-number">${stats.byType.chatgpt}</p>
            </div>
            <div class="stat-box">
                <h4>EXPRESS VPN</h4>
                <p class="stat-number">${stats.byType.expressvpn}</p>
            </div>
        </div>
    `;
}
```

---

## 🎨 CSS Styling

```css
.reward-badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
}

.reward-gemini {
    background: #FFE5B4;
    color: #8B7500;
}

.reward-cash {
    background: #B4E5FF;
    color: #004A7F;
}

.reward-chatgpt {
    background: #E5B4FF;
    color: #4A007F;
}

.reward-expressvpn {
    background: #B4FFE5;
    color: #004A3F;
}

.admin-controls {
    margin: 20px 0;
    padding: 15px;
    background: #F5F5F5;
    border: 1px solid #DDD;
}

.admin-controls select {
    padding: 8px 12px;
    margin-left: 10px;
    border: 1px solid #CCC;
    border-radius: 4px;
    cursor: pointer;
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.stat-box {
    background: #F9F9F9;
    padding: 20px;
    border: 1px solid #DDD;
    border-radius: 4px;
    text-align: center;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin: 10px 0 0 0;
}

.stat-number.success {
    color: #28A745;
}

.stat-number.warning {
    color: #FFC107;
}
```

---

## 📋 HTML Template

```html
<!-- Admin Page Structure -->
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="admin-container">
        <h1>Admin Panel - Reward Management</h1>
        
        <!-- Statistics -->
        <div id="statsDiv"></div>
        
        <!-- Controls -->
        <div class="admin-controls">
            <label for="rewardTypeFilter">Filter by Reward Type:</label>
            <select id="rewardTypeFilter" onchange="filterByRewardType()">
                <option value="">All Rewards</option>
                <option value="gemini">GEMINI PRO</option>
                <option value="cash">TIỀN MẶT</option>
                <option value="chatgpt">CHAT GPT PRO</option>
                <option value="expressvpn">EXPRESS VPN</option>
            </select>
            <button onclick="downloadCSV()">📥 Export CSV</button>
        </div>
        
        <!-- Table -->
        <table id="requestsTable" class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Reward Type</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="tableBody">
            </tbody>
        </table>
        
        <!-- Details Modal -->
        <div id="detailsModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeDetailsModal()">&times;</span>
                <div id="detailsContent"></div>
            </div>
        </div>
    </div>
    
    <script src="reward-manager.js"></script>
    <script src="config.js"></script>
    <script src="admin.js"></script>
</body>
</html>
```

---

## 🚀 Integration Steps

1. **Copy `reward-manager.js`** vào admin folder
2. **Cập nhật HTML structure** như template trên
3. **Cập nhật admin.js** với các function mới
4. **Thêm CSS** cho styling
5. **Test** tất cả 4 loại phần thưởng

---

## ✅ Checklist

- [ ] Thay đổi table name từ `gemini_requests` → `reward_requests`
- [ ] Thêm filter dropdown cho reward type
- [ ] Render table động dựa trên reward type
- [ ] Parse JSON từ reward_details
- [ ] Update status functionality
- [ ] View details modal
- [ ] Delete functionality
- [ ] Statistics dashboard
- [ ] CSS styling
- [ ] Test tất cả features

---

## 📊 Expected Output

Admin panel sẽ hiển thị:

```
┌─────────────────────────────────────────────────────────┐
│ Admin Panel - Reward Management                          │
├─────────────────────────────────────────────────────────┤
│ Statistics:                                              │
│ Total: 10 | Pending: 3 | Approved: 5 | Completed: 2   │
│ GEMINI: 4 | CASH: 2 | CHATGPT: 2 | EXPRESSVPN: 2      │
├─────────────────────────────────────────────────────────┤
│ Filter: [All Rewards ▼]  [Export CSV]                  │
├─────────────────────────────────────────────────────────┤
│ ID | Type | Contact | Status | Date | Actions          │
├─────────────────────────────────────────────────────────┤
│ 1 | GEMINI | contact@gmail.com | Pending | ... | View  │
│ 2 | CASH | 0123456789 (Vietcom) | Approved | ... | View │
│ 3 | CHATGPT | user@gmail.com | Completed | ... | View  │
│ ... | ... | ... | ... | ... | ...                       │
└─────────────────────────────────────────────────────────┘
```

Tất cả thông tin sẽ được parse từ JSON và hiển thị dễ đọc!
