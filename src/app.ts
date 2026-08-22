import "dotenv/config"
import cors from "cors"
import express, { type Request, type Response } from "express"
import cookieParser from "cookie-parser"
import { userRoute } from "./modules/users/users.route"
import { authRoute } from "./auth/auth.route"
import { providerRoute } from "./modules/provider/provider.route"
import { gearRoute, categoryRoute } from "./modules/gear/gear.route"
import { adminRoute } from "./modules/admin/admin.route"
import { rentalRoute } from "./modules/rentals/rentals.route"
// import { paymentRoute } from "./modules/payments/payments.route"
import { reviewRoute } from "./modules/reviews/reviews.route"


const app : express.Application = express()


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.get("/", (req : Request, res : Response) => {
    res.send("Hello World")
})

app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/provider", providerRoute)
app.use("/api/gear", gearRoute)
app.use("/api/categories", categoryRoute)
app.use("/api/admin", adminRoute)
app.use("/api/rentals", rentalRoute)
// app.use("/api/payments", paymentRoute)
app.use("/api/reviews", reviewRoute)


export default app