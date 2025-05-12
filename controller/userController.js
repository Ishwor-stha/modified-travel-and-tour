const User=require("../modles/userModel");
const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const {doValidations}=require("../utils/doValidations")
const { successMessage } = require("../utils/sucessMessage");
const { capaitlize } = require("../utils/capitalizedFirstLetter");

 
// register
module.exports.createUser=async(req,res,next)=>{
    try {
        if(!req.body || Object.keys(req.body).length===0)return next(new errorHandling("Empty body field please fill the form.",400));
        const requireFieds=["name","gender","phone","email","address","password","confirmPassword"];
        const check=requireFieds.filter(key=> !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim()==="");
        if(check.length !==0)return next(new errorHandling(`${check.join()} ${check.length>1?"fields are":"field is"} missing.`,400));
        const message=doValidations(req.body.email,req.body.phone,req.body.password,req.body.confirmPassword);
        if(message)return next(new errorHandling(message,400));
        const data={}
        req.body["name"]=capaitlize(req.body.name)
        for(let key in requireFieds){
            key=requireFieds[key];
            if(key==="confirmPassword")continue;
            if(key==="password"){
                data[key]=await bcrypt.hash(req.body[key],10);
                continue;
            }
            data[key]=req.body[key];
        }
        // console.log(data)
        const createUser=await User.create(data);
        if(!createUser)return next(new errorHandling("Cannot create a user please try again later.",500));
        successMessage(res,`${req.body.name} created sucessfully`,200)
        
    } catch (error) {
        return next((new errorHandling(error.message,error.statusCode||500)));
        
    }
}
// login
// update 
// forgot
// reset 
// delete
