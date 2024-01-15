import { ApiError } from "../utils/ApiErrors.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudniary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}
    } catch (error) {
        console.log(userId);
        throw new ApiError(500,"Something went wrong while generating  refresh and access token")
    }
}


const registerUser = asyncHandler( async ( req, res)=>{
    // we will get the data from body from frontend
    // check if all the required fields are sent properly
    // we will also check for files that were sent 
    // upload the files to cloudinary
    // check if the required files are sent properly
    // also debug the errors
    // we will return the response

    const {username , email, fullname, password} = req.body

    if( [username,email,fullname,password].some((fields) => 
        fields?.trim() === "")
    ) {
        throw new ApiError(400,"All the fields are required...",)
    }
    
    const exsistedUser = await User.findOne({
        $or : [{ username },{ email }]
    })

    if(exsistedUser){
        throw new ApiError(409,"User with same email or password alreawdy exsist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path 

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required.")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    
    
    if(!avatar){
        throw new ApiError(400,"Avatar file is required.")
    }
    

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully.")
    )
})


const loginUser = asyncHandler( async ( req, res ) => {
    // take the data email and password
    // find the user in the database
    // if user is there generate access and refresh token
    // send refresh token in cookie

    const {email , password} = req.body

    if( !email && !password ){
        throw new ApiError(400,"Email and password required")
    }

    const user  = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"User doesn't exsist...")
    }

    const isPasswordVerified = await user.isPasswordCorrect(password)

    if(!isPasswordVerified){
        throw new ApiError(401,"Invaild user Credentials")
    }
    console.log("ok until here");
    const {refreshToken, accessToken} = await generateAccessTokenAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res.status(200)
              .cookie("accessToken",accessToken,options)
              .cookie("refreshToken",refreshToken,options)
              .json(
                new ApiResponse(200,
                    {
                        user: loggedInUser , accessToken , refreshToken
                    },
                    "User logged in Successfully"
                )
              )
})


const logoutUser = asyncHandler ( async (req, res) =>{
    await User.findByIdAndUpdate(req.user._id,
            {
                $set : {
                    refreshToken : undefined
                }
            },
            {
                new : true
            }
        )
    const options = {
        httpOnly : true,
        secure: true
    }

    return res.status(200)
       .clearCookie("accessToken",options)
       .clearCookie("refreshToken",options)
       .json(new ApiResponse(200,{},"User Logged Out Successfully"))
})

const refreshAccessToken = asyncHandler( async ( req, res) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
   
   if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthroized request")
   }
   
   const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decodedToken._id)

   if(!user){
    throw new ApiError(401,"Invalid Refresh Token")
   }

   if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Invalid refresh token")
   }

   const {refreshToken,accessToken} = await generateAccessTokenAndRefreshToken(user._id)

   const options = {
    httpOnly:true,
    secure:true
   }

   res.status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken)
      .json(new ApiResponse(200,{accessToken,refreshToken},"Access Token Refreshed"))
})

export {registerUser , loginUser, logoutUser, refreshAccessToken}