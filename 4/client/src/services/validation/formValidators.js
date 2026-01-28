/**
 * Form Validators
 * Reusable validation functions for forms
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @returns {boolean} - True if not empty
 */
export function isRequired(value) {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
}

/**
 * Validates minimum length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @returns {boolean} - True if meets minimum
 */
export function hasMinLength(value, minLength) {
    return value && value.length >= minLength;
}

/**
 * Validates maximum length
 * @param {string} value - String to validate
 * @param {number} maxLength - Maximum length
 * @returns {boolean} - True if within maximum
 */
export function hasMaxLength(value, maxLength) {
    return !value || value.length <= maxLength;
}

/**
 * Validates phone number format (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates positive number
 * @param {number} value - Number to validate
 * @returns {boolean} - True if positive
 */
export function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Validates non-negative number
 * @param {number} value - Number to validate
 * @returns {boolean} - True if non-negative
 */
export function isNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Validates date is in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - True if in future
 */
export function isFutureDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj > new Date();
}

/**
 * Validates date is in the past
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - True if in past
 */
export function isPastDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
}

/**
 * Generic field validator
 * @param {Object} rules - Validation rules
 * @param {any} value - Value to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateField(rules, value) {
    if (rules.required && !isRequired(value)) {
        return rules.requiredMessage || 'This field is required';
    }

    if (rules.email && !isValidEmail(value)) {
        return rules.emailMessage || 'Invalid email format';
    }

    if (rules.minLength && !hasMinLength(value, rules.minLength)) {
        return rules.minLengthMessage || `Minimum length is ${rules.minLength}`;
    }

    if (rules.maxLength && !hasMaxLength(value, rules.maxLength)) {
        return rules.maxLengthMessage || `Maximum length is ${rules.maxLength}`;
    }

    if (rules.positive && !isPositiveNumber(value)) {
        return rules.positiveMessage || 'Must be a positive number';
    }

    if (rules.nonNegative && !isNonNegativeNumber(value)) {
        return rules.nonNegativeMessage || 'Must be a non-negative number';
    }

    if (rules.phone && !isValidPhone(value)) {
        return rules.phoneMessage || 'Invalid phone number format';
    }

    if (rules.url && !isValidUrl(value)) {
        return rules.urlMessage || 'Invalid URL format';
    }

    if (rules.custom && typeof rules.custom === 'function') {
        return rules.custom(value);
    }

    return null;
}

/**
 * Validates entire form using validation rules
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Rules for each field
 * @returns {Object} - { isValid: boolean, errors: {} }
 */
export function validateForm(formData, validationRules) {
    const errors = {};

    Object.keys(validationRules).forEach(fieldName => {
        const error = validateField(validationRules[fieldName], formData[fieldName]);
        if (error) {
            errors[fieldName] = error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
