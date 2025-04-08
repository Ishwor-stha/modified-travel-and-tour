module.exports.isValidNepaliPhoneNumber=(phoneNumber)=> {
    // Regular expression to match valid Nepali mobile numbers or landline numbers
    const nepaliPhonePattern = /^(98[0-9]{1}[0-9]{7}|97[0-9]{1}[0-9]{7}|981[0-9]{1}[0-9]{7}|980[0-9]{1}[0-9]{7}|01-[0-9]{7}|01[0-9]{7})$/;

    // Remove spaces and hyphens for validation
    const cleanPhoneNumber = phoneNumber.replace(/[-\s]/g, '');

    // Test the cleaned phone number
    return nepaliPhonePattern.test(cleanPhoneNumber);
}
