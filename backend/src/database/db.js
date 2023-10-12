import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ""

mongoose.connect(MONGODB_URI)

export const { connection } = mongoose

connection.on("error", console.error)
connection.on("connected", () => {
    console.log(`connect to mongodb at ${MONGODB_URI}`)
})

connection.on("reconnect", () => {
    console.log(`reconnect to mongodb at ${MONGODB_URI}`)
})

connection.on("SIGINT", async () => {
    await connection.close()
    console.log("Force to close connection to mongodb")
    process.exit(0)
})
