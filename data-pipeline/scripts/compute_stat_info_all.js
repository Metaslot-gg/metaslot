import dotenv from "dotenv"
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

export async function runAllStats(db) {
    console.log("==== compute all stats ====")
    // read only contract
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
                totalNumBets: { $sum: "$numGames" },
                totalBetsWon: { $sum: "$numBetsWon" },
                totalBetsLoss: { $sum: "$numBetsLoss" },
                hightestWin: { $max: "$grossProfitInDollor" },
                hightestMultiplier: { $max: "$multiplier" },
                grossProfit: { $sum: "$grossProfitInDollor" },
                netProfit: { $sum: "$totalProfitInDollor" },
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
                hightestWin: { $max: "$hightestWin" },
                hightestMultiplier: { $max: "$hightestMultiplier" },
                grossProfit: { $sum: "$grossProfit" },
                netProfit: { $sum: "$netProfit" },
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
            hightestWin: item.hightestWin,
            hightestMultiplier: item.hightestMultiplier,
            grossProfit: item.grossProfit,
            netProfit: item.netProfit,
        }
        await utils.upsertToModel(UserModel, { address: user.address }, user)
    }
    console.log("finish all stats")
}

connectDatabase()
    .then(async (db) => {
        await runAllStats(db)
    })
    .then((resolve) => {
        client.close()
        console.log("Done")
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(0)
    })
