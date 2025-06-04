module.exports.isValidNumber = (number) => {
    number = parseFloat(number);
    return typeof number === "number" && number <= 100 && number >= 0;
}