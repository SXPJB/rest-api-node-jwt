require('dotenv').config();

const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken');

const app=express();
const port=process.env.PORT || 4000;
const utils=require('./utils')

//enable cors
app.use(cors());
//parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));
const userData = {
    userId: "789789",
    password: "123456",
    name: "Clue Mediator",
    userName: "cluemediator",
    isAdmin: true
};

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes this helps to know if the request is authenticated or not
app.use((req, res, next) => {
    //chek header or url parameters or post parameters for token
    let token=req.headers['authorization']
    if(!token){
        return next();//if no token, continue
    }
    token=token.replace('Bearer ','');
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return res.status(401).json({
                success:false,
                message:'Invalid user'
            })
        }else{
            req.user=user;//set the user to req so other routes can use it
            next();
        }
    });
});
//request handlers
app.get("/",(req, res) => {
    if(!req.user){
        return res.status(401).json({
            success:false,
            message:'Invalid user to access it'
        });
    }
    res.send('Welcome to node api')
})
//validate the user credentials and return token
app.post('/users/signing',(req, res) => {
    const user=req.body.userName;
    const pwd=req.body.password;

    //return 400 status if username/password is not exist
    if(!user||!pwd){
        return res.status(400).json({
            success:false,
            message:'Username or password is required'
        });
    }
    //return 401 status if the credential is not match
    if(user!==userData.userName||pwd!==userData.password){
        return res.status(401).json({
            success:false,
            message:'Username or password is wrong'
        });
    }

    //generate token
    const token=utils.generateToken(userData);
    //get basic user details
    const userObj=utils.getCleanUser(userData);
    //return the token along with user details
    return res.json({
        success:true,
        user: userObj,
        token
    })
});
//verify the token and return it if it's valid
app.get('/verifyToken',(req, res) => {
    // check header on url parameters
    let token= req.query.token;
    if(!token){
        return res.status(400).json({
            success:false,
            message:'token is required'
        })
    }
    //check token that was passed by decoding token using secret
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return res.status(401).json({
                success:false,
                message:'Invalid token'
            })
        }
        //return 401 status if the userId does not match
        if (user.userId!==userData.userId){
            return res.status(401).json({
                success:false,
                massage:"Invalid user"
            })
        }
        //get basic user details
        let userObj = utils.getCleanUser(userData);
        return res.json({
            success:true,
            user:userObj,
            token
        })
    });
})

app.listen(port,()=>{
    console.log(`Sever on port: ${port}`)
})
