import "dotenv/config"
import cors from "cors"
import express, { type Request, type Response } from "express"
import cookieParser from "cookie-parser"


const app : express.Application = express()

// app.listen(3000, () => {
//     console.log("Server is running on port 3000")
// })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get("/", (req : Request, res : Response) => {
    res.send("Hello World")
})


export default app