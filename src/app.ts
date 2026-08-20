import "dotenv/config"
import cors from "cors"
import express, { type Request, type Response } from "express"
import cookieParser from "cookie-parser"
import { userRoute } from "./modules/users/users.route"


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

app.use("/api/users", userRoute)


export default app