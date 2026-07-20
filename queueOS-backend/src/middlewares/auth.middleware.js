const jwt=require("jsonwebtoken");
const protect=async(req,res,next)=>
{
    const authHeader=req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
    return res.status(401).json({
        success: false,
        message: "No token provided"
    });
}
const token=authHeader.split(" ")[1];
console.log(authHeader);
console.log(token);
try
{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
     console.log(decoded);
     req.user = decoded;
     next();

}catch(error)
{
    return res.status(401).json({
        success: false,
        message: "Invalid Token",
    });
}

    
}

module.exports=protect;