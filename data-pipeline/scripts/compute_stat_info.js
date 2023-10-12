import dotenv from "dotenv"
import ethers from "ethers"
import fs from "fs/promises"
import path from "path"
import { client, MONGODB_DATABASE } from "./models.js"
import _ from "lodash"
import utils from "./utils/index.js"

dotenv.config()

async function run() {
    console.log("==== catch up event ingestion ====")
    // read only contract
    await client.connect()
    const db = client.db(MONGODB_DATABASE)
    const cursor = await db.collection("GamePlayAndOutcomeEvent").aggregate([
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
                _id: { playerAddress: "$playerAddress", gameName: "$gameName" },
                gameCount: { $sum: 1 },
                totalWagered: { $sum: "$totalWageredInDollor" },
                totalNumBets: { $sum: "$numBets" },
                totalBetsWon: { $sum: "$numBetsWon" },
                totalBetsLoss: { $sum: "$numBetsLoss" },
                highestWin: { $max: "$grossProfitInDollor" },
                highestMultiplier: { $max: "$multiplier" },
                grossProfit: { $sum: "$grossProfitInDollor" },
                netProfit: { $max: "$totalProfitInDollor" },
            },
        },
        {
            $group: {
                _id: "$_id.playerAddress",
                gameCounts: {
                    $addToSet: {
                        name: "$_id.gameName",
                        count: "$gameCount",
                    },
                },
                totalWagered: { $sum: "$totalWagered" },
                totalNumBets: { $sum: "$totalNumBets" },
                totalBetsWon: { $sum: "$totalBetsWon" },
                totalBetsLoss: { $sum: "$totalBetsLoss" },
                highestWin: { $max: "$highestWin" },
                highestMultiplier: { $max: "$highestMultiplier" },
                grossProfit: { $sum: "$grossProfit" },
                netProfit: { $max: "$netProfit" },
            },
        },
    ])
    for await (const item of cursor) {
        const user = {
            address: item._id,
            gameCounts: item.gameCounts,
            totalWagered: item.totalWagered,
            totalNumBets: item.totalNumBets,
            totalBetsWon: item.totalBetsWon,
            totalBetsLoss: item.totalBetsLoss,
            highestWin: item.highestWin,
            highestMultiplier: item.highestMultiplier,
            grossProfit: item.grossProfit,
            netProfit: item.netProfit,
        }
        await utils.upsertToCollection(db.collection("User"), { address: user.address }, user)
    }
    client.close()
    console.log("client closed")
}

run().catch((e) => {
    console.log(e)
    process.exit(0)
})
