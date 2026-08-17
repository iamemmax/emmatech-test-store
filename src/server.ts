import express, { Request, Response } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import Logger from "morgan"
import "colors"
import { env } from "./utils/require-env";
import { errorHandler, notFound } from "./middlewares/errorHandlers";
import connectDb from "./config/db";
import userRouter from "./routes/users/user.router";
const app = express();
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(Logger("dev"))

app.get("/", (req:Request, res:Response) => {
    res.send("hello")
})

app.use("/api/users", userRouter)
app.use(notFound)
app.use(errorHandler)
// const PORT = process.env.PORT
connectDb().then(() => {
    console.log("db connected".blue);
    app.listen(env.port, () => {
        console.log(`server Started at port ${env.port}`.green);
    
    }); 
})