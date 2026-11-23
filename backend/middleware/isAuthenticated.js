import jwt from "jsonwebtoken";
const isAuthenticated =async(req, res, next)=>{
    try{
        const token = req.cookies.token;
        if(!token){
            return req.status(401).json({message:"user not authenticated"});
        }
        // token invalid 
        const decode = await jwt.verify( token, process.env.JWT_SECRET_KEY);
        console.log(decode);
        if(!decode){
            return res.status(401).json({message:"invalid token"});
        }
        //req.id is a variable to store user id
        req.id = decode.userId;
        next();   
    }
    catch(error){
        console.log(error);
    }
};
export default isAuthenticated;
const req ={
    id:"",
}
req.id ="stfcgjhrrg"