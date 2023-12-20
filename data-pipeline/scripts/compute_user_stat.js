import dotenv from "dotenv"
import { client, MONGODB_DATABASE } from "./mongodb.js"
import { runWeeklyInfo } from "./compute_stat_info_weekly.js"
import { runMonthlyInfo } from "./compute_stat_info_monthly.js"
import { runAllStats } from "./compute_stat_info_all.js"

dotenv.config()

async function connectDatabase() {
    await client.connect()
    const db = client.db(MONGODB_DATABASE)
    return db
}

connectDatabase()
    .then(async (db) => {
        await runAllStats(db).catch(console.error)
        await runWeeklyInfo(db).catch(console.error)
        await runMonthlyInfo(db).catch(console.error)
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
