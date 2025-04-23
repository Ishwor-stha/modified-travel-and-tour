module.exports=(err,req,res,next)=>{
    const statusCode = err.statusCode || 500;  // Default to 500 if statusCode is not set
    const status = err.status || "false";      // Default to "error" if status is not set
    // console.log(process.env.NODE_ENV)
    // all the error details comes from the user through ../utils/error handling
    if(process.env.NODE_ENV=="development"){
        return res.status(statusCode).json({
            status:status,
            message:err.message,
            detail:err.stack
    
        });

    }else{
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message ||"Something went wrong.Please try again."
          
        });
    }
    
}
