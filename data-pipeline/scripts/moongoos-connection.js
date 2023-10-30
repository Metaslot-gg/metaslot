import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || ""

const User = new mongoose.Schema(
    {
        address: { type: String, required: true, unique: true },
        username: String,
        gameCounts: [
            {
                name: String,
                count: Number,
            },
        ],
        totalWagered: Number,
        totalNumBets: Number,
        totalBetsWon: Number,
        totalBetsLoss: Number,
        hightestMultiplier: Number,
        hightestWin: Number,
        grossProfit: { type: Number, index: true },
        netProfit: { type: Number, index: true },
        weeklyGrossProfit: { type: Number, index: true },
        weeklyNetProfit: { type: Number, index: true },
        monthlyGrossProfit: { type: Number, index: true },
        monthlyNetProfit: { type: Number, index: true },
        createdAt: Number,
        createdAt: Number,
    },
    {
        collection: "User",
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "createdAt",
        },
    }
)

mongoose.connect(MONGODB_URI, { dbName: MONGODB_DATABASE })

export const { connection } = mongoose

export const UserModel = mongoose.model("User", User)

connection.on("error", console.error)
connection.on("connected", () => {
    console.log(`connect to mongodb at ${MONGODB_URI}`)
})
