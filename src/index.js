import dotenv from "dotenv";
import connectDB from "./db/index.js";
import{app} from "./app.js"

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is runnning at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection FAILED !!! ", err);
})


















// ;( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error) =>{
//             console.log("app couldn't connect to the database :" ,error );
//             throw error
//         })
        
//     } catch (error) {
//         console.error("ERROR" ,error)
//         throw error
//     }
// })()