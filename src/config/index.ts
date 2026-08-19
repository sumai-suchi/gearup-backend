import dotenv from "dotenv";
import path from "path";
dotenv.config({
    path : path.join(process.cwd(), ".env")
});


export default {
    PORT : process.env.PORT,
    db_url: process.env.DATABASE_URL,
    app_url: process.env.APP_URL,
    // jwt_acess_secret : process.env.JWT_ACCESS_SECRET,
    // jwt_refresh_secret : process.env.JWT_REFRESH_SECRET,
    // bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS,
    // JWT_SECRET : process.env.JWT_SECRET,
    // NODE_ENV : process.env.NODE_ENV,
    // STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY
}