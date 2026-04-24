import { connectDB } from "./db/db";
import app from "./app"
import { createServer } from "node:http";



async function startDB(){
    await connectDB().then(() => console.log("DB connected"))

    const server = createServer(app)
    const PORT = process.env.PORT || 3000
    server.listen(PORT,()=>{
        console.log("Server Connected");
    }      
    )
}

startDB().catch(()=>{
    console.log("Server Connection Error");
})






