// Reward Manager - Manages different reward types and their requirements
// This file handles the logic for different reward types: GEMINI, CASH, CHATGPT, EXPRESS VPN

const REWARD_TYPES = {
    GEMINI: 'gemini',
    CASH: 'cash',
    CHATGPT: 'chatgpt',
    EXPRESSVPN: 'expressvpn'
};

const REWARD_CONFIGS = {
    [REWARD_TYPES.GEMINI]: {
        label: 'GEMINI PRO 1 Năm',
        description: 'Nhận tài khoản Gemini Pro 1 năm miễn phí',
        fields: [
            { id: 'email', label: 'Email Google *', type: 'email', placeholder: 'example@gmail.com', required: true },
            { id: 'password', label: 'Mật khẩu *', type: 'password', placeholder: 'Nhập mật khẩu', required: true },
            { id: 'contactEmail', label: 'Email liên hệ *', type: 'email', placeholder: 'contact@example.com', required: true }
        ],
        hideForLanguage: [] // Hiển thị cho tất cả các ngôn ngữ
    },
    [REWARD_TYPES.CASH]: {
        label: '50K Tiền mặt',
        description: 'Nhận phần thưởng 50,000 VND',
        fields: [
            { id: 'contactEmail', label: 'Email liên hệ *', type: 'email', placeholder: 'contact@example.com', required: true },
            { id: 'accountNumber', label: 'Số tài khoản *', type: 'text', placeholder: '1234567890', required: true },
            { id: 'bankName', label: 'Tên ngân hàng *', type: 'text', placeholder: 'Vietcombank', required: true }
        ],
        hideForLanguage: ['en'] // Ẩn đối với tiếng Anh
    },
    [REWARD_TYPES.CHATGPT]: {
        label: 'CHAT GPT PRO 1 Tháng',
        description: 'Nhận tài khoản ChatGPT Pro 1 tháng',
        fields: [
            { id: 'contactEmail', label: 'Email liên hệ *', type: 'email', placeholder: 'contact@example.com', required: true },
            { id: 'chatgptInviteEmail', label: 'Email mời ChatGPT *', type: 'email', placeholder: 'invite@example.com', required: true }
        ],
        hideForLanguage: [] // Hiển thị cho tất cả các ngôn ngữ
    },
    [REWARD_TYPES.EXPRESSVPN]: {
        label: 'EXPRESS VPN 1 Tháng',
        description: 'Nhận tài khoản Express VPN 1 tháng',
        fields: [
            { id: 'contactEmail', label: 'Email liên hệ *', type: 'email', placeholder: 'contact@example.com', required: true }
        ],
        hideForLanguage: [] // Hiển thị cho tất cả các ngôn ngữ
    }
};

// Build reward_details JSON string from form data
function buildRewardDetails(rewardType, formData) {
    const details = {};
    const config = REWARD_CONFIGS[rewardType];
    
    if (!config) {
        throw new Error(`Invalid reward type: ${rewardType}`);
    }
    
    // Collect only the fields defined for this reward type
    config.fields.forEach(field => {
        if (formData[field.id]) {
            details[field.id === 'email' ? 'email' : 
                   field.id === 'password' ? 'password' :
                   field.id === 'contactEmail' ? 'contact_email' :
                   field.id === 'accountNumber' ? 'account_number' :
                   field.id === 'bankName' ? 'bank_name' :
                   field.id === 'chatgptInviteEmail' ? 'chatgpt_invite_email' :
                   field.id] = formData[field.id].trim();
        }
    });
    
    return JSON.stringify(details);
}

// Parse reward_details JSON string back to object
function parseRewardDetails(detailsJson) {
    try {
        return JSON.parse(detailsJson);
    } catch (error) {
        console.error('Error parsing reward details:', error);
        return {};
    }
}

// Validate form data for a specific reward type
function validateRewardForm(rewardType, formData) {
    const config = REWARD_CONFIGS[rewardType];
    
    if (!config) {
        return { valid: false, error: 'Invalid reward type' };
    }
    
    for (let field of config.fields) {
        const value = formData[field.id];
        
        if (field.required && (!value || value.trim() === '')) {
            return { valid: false, error: `${field.label} is required` };
        }
        
        if (field.type === 'email' && value && !isValidEmail(value)) {
            return { valid: false, error: `${field.label} must be a valid email` };
        }
    }
    
    return { valid: true };
}

// Get visible reward types based on language
function getVisibleRewardTypes(language = 'vi') {
    return Object.entries(REWARD_CONFIGS)
        .filter(([type, config]) => !config.hideForLanguage.includes(language))
        .map(([type, config]) => ({ type, ...config }));
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Format reward data for display
function formatRewardDisplay(rewardType, detailsJson) {
    const details = parseRewardDetails(detailsJson);
    const config = REWARD_CONFIGS[rewardType];
    
    if (!config) return 'Unknown reward type';
    
    let display = `<strong>${config.label}</strong><br>`;
    
    config.fields.forEach(field => {
        const key = field.id === 'email' ? 'email' :
                   field.id === 'password' ? 'password' :
                   field.id === 'contactEmail' ? 'contact_email' :
                   field.id === 'accountNumber' ? 'account_number' :
                   field.id === 'bankName' ? 'bank_name' :
                   field.id === 'chatgptInviteEmail' ? 'chatgpt_invite_email' :
                   field.id;
        
        if (details[key]) {
            const maskedValue = field.type === 'password' ? '•••••••' : details[key];
            display += `${field.label.replace('*', '')}: ${maskedValue}<br>`;
        }
    });
    
    return display;
}
