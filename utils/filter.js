const xss=require("xss")
module.exports.sanitize=(req,res,next)=>{
    if(!req.body || Object.keys(req.body).length===0){
        return next();
        
    }
    for(key in req.body){
        req.body[key]=xss(req.body[key]);
        
    }
    next();


}