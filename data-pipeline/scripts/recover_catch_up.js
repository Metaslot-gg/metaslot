import dotenv from "dotenv"
import ethers from "ethers"
import fs from "fs/promises"
import path from "path"
import { client, MONGODB_DATABASE } from "./mongodb.js"
import _ from "lodash"
import utils from "./utils/index.js"

const __dirname = path.resolve(path.dirname(""))
const DiceJson = await fs.readFile(
    path.join(__dirname, "contracts/artifacts/contracts/games/Dice.sol/Dice.json")
)
const CoinFlipJson = await fs.readFile(
    path.join(__dirname, "contracts/artifacts/contracts/games/CoinFlip.sol/CoinFlip.json")
)
const RpsJson = await fs.readFile(
    path.join(
        __dirname,
        "contracts/artifacts/contracts/games/RockPaperScissors.sol/RockPaperScissors.json"
    )
)
const Dice = JSON.parse(DiceJson)
const CoinFlip = JSON.parse(CoinFlipJson)
const Rps = JSON.parse(RpsJson)

dotenv.config()

const ALCHEMY_APIKEY = process.env.ALCHEMY_APIKEY || ""
const CHAIN_ID = parseInt(process.env.CHAIN_ID || "0")
const DICE_GAME_ADDRESS = process.env.DICE_ADDRESS || ""
const COIN_FLIP_ADDRESS = process.env.COIN_FLIP_ADDRESS || ""
const ROCK_PAPER_SCISSORS = process.env.ROCK_PAPER_SCISSORS || ""
const WAGER_UNIT = process.env.WAGER_UNIT || "weii"
const CHAIN_RPC_URL = process.env.CHAIN_RPC_URL || "" 

// const provider = new ethers.providers.AlchemyProvider(CHAIN_ID, ALCHEMY_APIKEY)
const provider =
    CHAIN_ID == 56 || CHAIN_ID == 97 || CHAIN_ID == 1204 || CHAIN_ID == 1205 
        ? new ethers.providers.JsonRpcProvider(CHAIN_RPC_URL)
        : new ethers.providers.AlchemyProvider(CHAIN_ID, ALCHEMY_APIKEY)
const commit = true

async function run() {
    console.log("==== catch up event ingestion ====")
    // read only contract
    await client.connect()
    const db = client.db(MONGODB_DATABASE)
    const dice = new ethers.Contract(DICE_GAME_ADDRESS, Dice.abi, provider)
    const coin = new ethers.Contract(COIN_FLIP_ADDRESS, CoinFlip.abi, provider)
    const rps = new ethers.Contract(ROCK_PAPER_SCISSORS, Rps.abi, provider)

    const diceCheckpoint = await utils.getCheckPoint(db, CHAIN_ID.toString() + "-" + "Dice")
    const coinCheckpoint = await utils.getCheckPoint(db, CHAIN_ID.toString() + "-" + "CoinFlip")
    const rpsCheckpoint = await utils.getCheckPoint(
        db,
        CHAIN_ID.toString() + "-" + "RockPaperScissors"
    )

    console.log("process Dice from block number: ", diceCheckpoint?.value)
    const diceEvents = await dice.queryFilter(
        { events: ["Dice_Play_Event", "Dice_Outcome_Event"] },
        diceCheckpoint ? diceCheckpoint.value : 33411183
    )
    _.forEach(
        diceEvents,
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "Dice",
            utils.DicePlayEventToJoinedDocument,
            utils.DiceOutcomeEventToJoinedDocument,
            false,
            WAGER_UNIT
        )
    )
    const lastDice = _.maxBy(diceEvents, (item) => item.blockNumber)
    console.log("dice process to block number: ", lastDice?.blockNumber)
    commit &&
        utils.upsertToCollection(
            db.collection("PipeLineCheckPoints"),
            { key: CHAIN_ID.toString() + "-Dice" },
            { value: lastDice.blockNumber }
        )
    /** Coin Flip **/
    console.log("process coin flip from block number:", coinCheckpoint?.value)
    const coinEvents = await coin.queryFilter(
        {
            events: ["CoinFlip_Play_Event", "CoinFlip_Outcome_Event"],
        },
        coinCheckpoint ? coinCheckpoint.value : 33609527
    )
    _.forEach(
        coinEvents,
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "CoinFlip",
            utils.CoinFlipPlayEventToJoinedDocument,
            utils.CoinFlipOutcomeEventToJoinedDocument,
            false,
            WAGER_UNIT
        )
    )
    const lastCoin = _.maxBy(coinEvents, (item) => item.blockNumber)
    commit &&
        utils.upsertToCollection(
            db.collection("PipeLineCheckPoints"),
            { key: CHAIN_ID.toString() + "-CoinFlip" },
            { value: lastCoin.blockNumber }
        )
    console.log("coin process to block number: ", lastCoin?.blockNumber)
    /**  RPS  **/
    console.log("process rock paper scissors frommm block number,", rpsCheckpoint?.value)
    const rpsEvents = await rps.queryFilter(
        {
            event: ["RockPaperScissors_Play_Event", "RockPaperScissors_Outcome_Event"],
        },
        rpsCheckpoint ? rpsCheckpoint.value : 33411214
    )
    _.forEach(
        rpsEvents,
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "RockPaperScissors",
            utils.RpsPlayEventToJoinedDocument,
            utils.RpsOutcomeEventToJoinedDocument,
            false,
            WAGER_UNIT
        )
    )
    const lastRps = _.maxBy(rpsEvents, (item) => item.blockNumber)
    commit &&
        utils.upsertToCollection(
            db.collection("PipeLineCheckPoints"),
            { key: CHAIN_ID.toString() + "-RockPaperScissors" },
            { value: lastCoin.blockNumber }
        )
    console.log("rps process to block number: ", lastRps?.blockNumber)
}

run()
    .then((resolve) => {
        console.log("done")
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(0)
    })
