import dotenvflow from "dotenv-flow";
dotenvflow.config();


export default {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI
}