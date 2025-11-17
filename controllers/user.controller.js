import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs"
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgetPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken"



export async function registerUserController(req,res) {
    try {
        //getting feilds from request
        const {name,email,password} = req.body;
        console.log(name)

        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Please provide all required fields"
            })
        }

        //checking email fromatting
        const emailChecker = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailChecker.test(email)){
            return res.status(400).json({
                success:false,
                message:"Invalid email format"
            })
        }

        //checking email is Alredy register or not
        const emailRegisterAlready = await UserModel.findOne({email});
        if(emailRegisterAlready){
            return res.status(400).json({
                success:false,
                message:"Email Already registered"
            })
        }

        //hash password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);


        const user = await UserModel.create({
            name,
            email,
            password:hashedPassword
        })

        const VerifyEmailUrl=`${process.env.FRONTEND_URL}/verfy-email?code=${user._id}`

        const  verifyEmail = await sendEmail({
            sendTo:email,
            subject:"verify email  from blinkeyit",
            html:verifyEmailTemplate({
                name,
                url:VerifyEmailUrl
            })
        })

        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user
        })



        
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function verifyEmailController(req,res){
    try {
        const {code} = req.body;
        
        const user = await UserModel.findOne({_id:code});
        if(!user){
            return res.status(400).json({
                message:"Invalid code",
                error:true,
                success:false
            })
        }

        const updateUser = await UserModel.updateOne({_id:code},{
            verify_email:true
        })

        return res.status(200).json({
            message:"verification email done",
            success:true,
            error:false
        })
        
    } catch (error) {
         return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function loginUserController(req,res){
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"All field shuld be fiiled",
                error:true,
                success:false
            })
        }

        const user = await UserModel.findOne({email});

        if(!user){
            return res.status(400).json({
                message:"User not register",
                error:true,
                success:false
            })
        }

        if(user.status !=="Active"){
            return res.status(400).json({
                message:"Contact to Admin",
                error:true,
                success:false
            })
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid credentials ",
                error:true,
                success:false,
            })
        }



        const accessToken = await generateAccessToken(user._id)
        const refreshToken = await generateRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }

        res.cookie("accessToken",accessToken,cookiesOption)
        res.cookie("refreshToken",refreshToken,cookiesOption)

        return res.status(200).json({
            message:"logged in successsfully",
            error:false,
            success:true,
            data:{
                accessToken,
                refreshToken,
                user:user,
            }
        })




    } catch (error) {
         return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
    })
  }
}

export async function logoutUserController(req,res){
  try {
    
    const userId = req.userId;

        const cookiesOption = {
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }

        res.clearCookie("accessToken",cookiesOption)
        res.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken =  await UserModel.findByIdAndUpdate({_id:userId},{refresh_token:""})

        return res.status(200).json({
            message:"Logout successfull",
            error:false,
            success:true
        })

    
  } catch (error) {
     return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
    }) 
  }
}

//upload user avtar
export async function uploadAvatar(req,res){

    try {
        const userId = req.userId //auth middleware
        const image = req.file //multer middleware
      
        const upload = await uploadImageCloudinary(image);
        console.log(upload)

        const updateAvatar = await UserModel.findByIdAndUpdate({_id:userId},{
            avatar:upload.url
        })

        return res.status(200).json({
            message:"avatar upload successfully",
            data: {
                _id:userId,
                avatar:upload.url
            }
        })

        
    } catch (error) {
       return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
    }) 
    }
}

//update profile
 export async function updateUserProfile(req,res){
    try {
         const userId  = req.userId
        const {name,email,mobile,password} = req.body;

        const user = await UserModel.findById({_id:userId});
        console.log("user",user)

        if(!user){
            return res.status(400).json({
                message:"Invalid user"
            })
        }

       if(password){
        const hashedPassword = await bcrypt.hash(password,10);
        user.password = hashedPassword;
       }

       if(name){
        user.name = name;
       }

       if(email){
        user.email = email;
       }

       if(mobile){
        user.mobile = mobile;
       }

       const updatedUser = await user.save();
       console.log("updated",updateUserProfile)

       return res.status(200).json({
         message:"profile updated sucessfully",
         data:updatedUser
       })



        
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
    }) 
    }
 }

// forgot password not login
export async function forgotPasswordController(req,res){
    try {
         const {email} = req.body;

         if(!email){
            return res.status(400).json({
                message:"email requires",
                error:true,
                success:false
            })
         }

         const user = await UserModel.findOne({email:email});
         if(!user){
            return res.status(400).json({
                message:"user not found",
                success:false
            })
         }
        //  console.log("forget user",user)

         const otp = generateOtp();
         const expiryTime = new Date()+10*60*1000 // 10 min

         const updateResetPassword = await UserModel.findByIdAndUpdate({_id:user._id},{
            forgot_password_otp:otp,
            forget_password_expiry:new Date(expiryTime)
         })
        //  console.log("updatedPass",updateResetPassword)

         await sendEmail({
            sendTo:email,
            subject:"Forgot password from blinkeyit",
            html:forgetPasswordTemplate({
                name:user.name,
                otp:otp
            })
         })

         return res.status(200).json({
            message:"check you email",
            error:false,
            sucess:true,
            data:otp
         })


         
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
    }) 
    }
}

//verify forgot password otp
export async function verifyFogotPassword(req,res){
    try {
        const {email,otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({
                message:"Provide requires fields",
                error:true,
                sucess:false,
            })
        }

        const user = await UserModel.findOne({email:email});
        if(!user){
            return res.status(400).json({
                message:"email is not valid",
                success:false,
                error:true
            })
        }
        console.log(user)

        const currentTime = new Date();
        if(user.forget_password_expiry > currentTime){
            return res.status(400).json({
                message:"OTP expired",
                success:false,
                error:true
            })
        }

        if(otp !== user.forgot_password_otp){
            return res.status(400).json({
                message:"Invalid otp",
                success:false,
                error:true
            })
        }

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : null,
            forget_password_expiry:null,
        })
 
        return res.status(200).json({
            message:"otp verified",
            success:true,
            error:false

        })
        
    } catch (error) {
         return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
       })
    }
}

//reset Password 
export async function resetPassword(req,res){
    try {
        const {email, newPassword,confirmPassword} = req.body;
    if(!email || !newPassword  || !confirmPassword ){
        return res.status(400).json({
            message:" All feilds required",
            success:false,
            error:true,
        })
    }

    const user = await UserModel.findOne({email:email});
    if(!user){
        return res.status(400).json({
            message:"Invalid email",
            success:false,
            error:true
        })
    }

    if(newPassword!== confirmPassword){
        return res.status(400).json({
            message:"Password misMatch",
            success:false,
            error:true,

        })
    }

    const hashedPassword = await bcrypt.hash(newPassword,10);

    const restPassword = await UserModel.findByIdAndUpdate({_id:user._id},{
        password:hashedPassword
    });

    return res.status(200).json({
        message:"password reset successfully",
        success:true,
        error:false,
    })

    
     
        
    } catch (error) {
          return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
       })
    }
}
 
//refresh Token controller
export async function refreshTokenController(req,res){
    try {
        const refreshToken = req.cookies.refreshToken || req.headers.authorization.split(" ")[1];

        if(!refreshToken){
            return res.status(401).json({
                message:"Invalid token",
                error:true,
                success:false,
            })
        }

        const verifyToken = jwt.verify(refreshToken,process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!verifyToken){
            return res.status(401).json({
                message:"Token is expired",
                error:true,
                success:false,
            })
        }

        const userId = verifyToken?._id;
        

        const newAccessToken = await generateAccessToken(userId);
          const cookiesOption = {
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.cookie("accessToken",newAccessToken,cookiesOption)

        return res.status(200).json({
            message:"new Access token genrated",
            error:true,
            success:false
        })



        
    } catch (error) {
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
       })
    }
}

//fetch user detail
export async function userDetail(req,res){
    try {
        const userId = req.userId;

        const user = await UserModel.findById(userId).select("-password -refresh_token")

        if(!user){
            return res.status(404).json({
                message:"user not found",
                error:true,
                success:false
            })
        }
        console.log(user);
        

        return res.status(200).json({
            message:"get detail sucessfully",
            error:false,
            success:true,
            data:user

        })

    } catch (error) {
         return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
       })
    }
}


