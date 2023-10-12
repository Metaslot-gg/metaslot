import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
console.log("mongodb - uri", process.env.MONGODB_URI)
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
    dotenv.config()
    if (!process.env.MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env")
    }

    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        }
        console.log("mongodb uri -- ", process.env.MONGODB_URI)
        cached.promise = mongoose
            .connect(
                process.env.MONGODB_URI,
                //"mongodb+srv://metaslot:BWpx8aNruMxmk0UA@metaslot.305cig0.mongodb.net/?retryWrites=true&w=majority",
                opts
            )
            .then((mongoose) => {
                console.log("connect to mongoose")
                return mongoose
            })
    }

    try {
        cached.conn = await cached.promise
    } catch (e) {
        cached.promise = null
        throw e
    }

    return cached.conn
}

export default dbConnect
