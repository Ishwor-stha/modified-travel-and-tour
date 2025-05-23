module.exports.isValidNepaliPhoneNumber = (phoneNumber) => {
    // Clean the input
    const cleanPhoneNumber = phoneNumber.replace(/[-\s]/g, '');

    // Nepali mobile: 98xxxxxxxx or 97xxxxxxxx (10 digits)
    // Landline: 01xxxxxxxx or 01-xxxxxxx (9 or 10 digits)
    const nepaliPhonePattern = /^(98\d{8}|97\d{8}|01\d{7,8})$/;

    return nepaliPhonePattern.test(cleanPhoneNumber);
};
