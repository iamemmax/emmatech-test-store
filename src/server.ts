import express, { NextFunction, Request, Response } from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
import Logger from "morgan"
import "colors"
import { env } from "./utils/require-env";
import { errorHandler, notFound } from "./middlewares/errorHandlers";
import connectDb from "./config/db";
import userRouter from "./routes/users/user.router";
import categoryRouter from "./routes/categories/cateories.router";
import productRouter from "./routes/products/product.router";
import multer from 'multer';
const app = express();
app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(Logger("dev"))

app.get("/", (req:Request, res:Response) => {
    res.send("hello")
})
// after your routes, in app.ts


app.use("/api/users", userRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/products", productRouter)
app.use(notFound)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.log({ code: err.code, field: err.field });
    return res.status(400).json({ res: 'fail', msg: err.message, field: err.field });
  }
  next(err);
});


app.use(errorHandler)
// const PORT = process.env.PORT
connectDb().then(() => {
    console.log("db connected".blue);
    app.listen(env.port, () => {
        console.log(`server Started at port ${env.port}`.green);
    
    }); 
})