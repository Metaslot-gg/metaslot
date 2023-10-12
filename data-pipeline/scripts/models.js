import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || ""
const client = new MongoClient(MONGODB_URI)

export { client, MONGODB_DATABASE }
