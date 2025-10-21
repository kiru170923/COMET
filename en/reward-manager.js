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
        label: 'GEMINI PRO 1 Year',
        description: 'Get Gemini Pro account for 1 year',
        fields: [
            { id: 'email', label: 'Google Email *', type: 'email', placeholder: 'example@gmail.com', required: true },
            { id: 'password', label: 'Password *', type: 'password', placeholder: 'Enter password', required: true },
            { id: 'contactEmail', label: 'Contact Email *', type: 'email', placeholder: 'contact@example.com', required: true }
        ],
        hideForLanguage: [] // Show for all languages
    },
    [REWARD_TYPES.CASH]: {
        label: '50K Cash',
        description: 'Receive 50,000 VND cash reward',
        fields: [
            { id: 'contactEmail', label: 'Contact Email *', type: 'email', placeholder: 'contact@example.com', required: true },
            { id: 'accountNumber', label: 'Account Number *', type: 'text', placeholder: '1234567890', required: true },
            { id: 'bankName', label: 'Bank Name *', type: 'text', placeholder: 'Vietcombank', required: true }
        ],
        hideForLanguage: ['en'] // Hide for English
    },
    [REWARD_TYPES.CHATGPT]: {
        label: 'CHAT GPT PRO 1 Month',
        description: 'Get ChatGPT Pro account for 1 month',
        fields: [
            { id: 'contactEmail', label: 'Contact Email *', type: 'email', placeholder: 'contact@example.com', required: true },
            { id: 'chatgptInviteEmail', label: 'ChatGPT Invite Email *', type: 'email', placeholder: 'invite@example.com', required: true }
        ],
        hideForLanguage: [] // Show for all languages
    },
    [REWARD_TYPES.EXPRESSVPN]: {
        label: 'EXPRESS VPN 1 Month',
        description: 'Get Express VPN account for 1 month',
        fields: [
            { id: 'contactEmail', label: 'Contact Email *', type: 'email', placeholder: 'contact@example.com', required: true }
        ],
        hideForLanguage: [] // Show for all languages
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
