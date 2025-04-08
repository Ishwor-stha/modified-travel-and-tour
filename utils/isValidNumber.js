module.exports.isValidNumber=(number)=>{
    number=parseInt(number);
    return typeof number=== "number"&& number<=100 &&number >=0;
}