import {v2 as cloudinary} from "cloudinary"
import { log } from "console"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadClloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"

        })
        console.log("File is uploaded on cloudinary")
        console.log(response);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove th elocally saved temporary file as the upload operation get failed
        
    }   
}