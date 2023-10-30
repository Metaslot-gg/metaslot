import dotenv from "dotenv"
import ethers from "ethers"
import fs from "fs/promises"
import path from "path"
import { connection, UserModel } from "./moongoos-connection.js"
import { client, MONGODB_DATABASE } from "./mongodb.js"
import _ from "lodash"
import utils from "./utils/index.js"

dotenv.config()

async function connectDatabase() {
    await client.connect()
    const db = client.db(MONGODB_DATABASE)
    return db
}

export async function runMonthlyInfo(db) {
    console.log("==== compute monthly stats  ====")
    let now = new Date()
    const from = now.setDate(now.getDate() - 30)
    const cursor = await db.collection("GamePlayAndOutcomeEvent").aggregate([
        {
            $match: { outcomeTxTmp: { $gte: parseInt(from / 1000) } },
        },
        {
            $addFields: {
                grossProfitInDollor: {
                    $cond: {
                        if: { $gt: ["$totalProfitInDollor", 0] },
                        then: "$totalProfitInDollor",
                        else: 0,
                    },
                },
            },
        },
        {
            $group: {
                _id: { playerAddress: "$playerAddress" },
                monthlyGrossProfit: { $sum: "$grossProfitInDollor" },
                monthlyNetProfit: { $sum: "$totalProfitInDollor" },
            },
        },
    ])

    for await (const item of cursor) {
        const user = {
            address: item._id.playerAddress,
            monthlyGrossProfit: item.monthlyGrossProfit,
            monthlyNetProfit: item.monthlyNetProfit,
        }
        await utils.upsertToModel(UserModel, { address: user.address }, user)
    }
    client.close()
    console.log("finish monthly stats")
}

// connectDatabase()
//     .then(async (db) => {
//         await runMonthlyInfo(db)
//     })
//     .then((resolve) => {
//         client.close()
//         console.log("Done")
//         process.exit(0)
//     })
//     .catch((e) => {
//         console.log(e)
//         process.exit(0)
//     })
