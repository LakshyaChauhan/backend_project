import { ApiError } from "../utils/ApiErrors.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudniary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async ( req, res)=>{
    // we will get the data from body from frontend
    // check if all the required fields are sent properly
    // we will also check for files that were sent 
    // upload the files to cloudinary
    // check if the required files are sent properly
    // also debug the errors
    // we will return the response

    const {username , email, fullname, password} = req.body
    console.log(email);

    if( ![username,email,fullname,password].some((fields) => 
        fields?.trim() === "")
    ) {
        throw new ApiError(400,"All the fields are required...",)
    }
    
    const exsistedUser =  User.findOne({
        $or : [{ username },{ email }]
    })

    if(exsistedUser){
        throw new ApiError(409,"User with same email or password alreawdy exsist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(req.files?.avatar[0]?.path);

    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required.")
    }
    
    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"Avatar file is required.")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser0){
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully.")
    )
})

export {registerUser}