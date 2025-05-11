const User=require("../modles/userModel");
const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const {doValidations}=require("../utils/doValidations")
const { successMessage } = require("../utils/sucessMessage");

 
// register
module.exports.createUser=async(req,res,next)=>{
    try {
        if(!req.body || Object.keys(req.body).length===0)return next(new errorHandling("Empty body field please fill the form.",400));
        const requireFieds=["name","gender","phone","email","address","password","confirmPassword"];
        const check=requireFieds.filter(key=> !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim()==="");
        if(check.length !==0)return next(new errorHandling(`${check.join()} fields are missing.`,400));
        const message=doValidations(email,phone,password,confirmPassword);
        if(message)return next(new errorHandling(message,400));
        const data={}
        for(key in requireFieds){
            if(key==="confirmPassword")continue;
            if(key==="password"){
                data[key]=await bcrypt.hash(req.body[key],10);
                continue;
            }
            data[key]=req.body[key];
        }   

        
        
    } catch (error) {
        return next((new errorHandling(error.message,error.statusCode||500)));
        
    }
}
// login
// update 
// forgot
// reset 
// delete
