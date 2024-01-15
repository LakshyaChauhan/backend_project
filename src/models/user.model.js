import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchmea = new  Schema(
    {
        username:{
            type:String,
            required : true,
            unique : true,
            lowercase: true,
            trim : true,
            index : true
        },
        email:{
            type:String,
            required : true,
            unique : true,
            lowercase: true,
            trim : true,
        },
        fullname:{
            type:String,
            required : true,
            lowercase: true,
            trim : true,
        },
        avatar:{
            type:String, // cloudniary url
            required : true,
        },
        coverImage:{
            type:String , //cloudinary url
        },
        watchHistory   :{
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        password:{
            type : String,
            reqiured : [true, "Password is required"]
        },
        refreshToken: {
            type : String
        }        
    },
    {
        timestamps :true
    }
)

userSchmea.pre("save",async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password ,10)
    next()
})

userSchmea.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchmea.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchmea.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchmea)