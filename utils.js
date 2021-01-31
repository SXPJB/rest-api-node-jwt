var jwt=require('jsonwebtoken');

function generateToken(user){

    if(!user){
        return null
    }

    var u={
        userId:user.userId,
        name:user.name,
        username:user.userName,
        isAdmin:user.isAdmin
    };
    return jwt.sign(u,process.env.JWT_SECRET,{
        expiresIn: 60*60*24//expires in 24 hours
    });
}

function getCleanUser(user){
    if(!user){
        return null;
    }

    return{
        userId:user.userId,
        name:user.name,
        username:user.userName,
        isAdmin:user.isAdmin
    };
}
module.exports={
    generateToken,
    getCleanUser
}
