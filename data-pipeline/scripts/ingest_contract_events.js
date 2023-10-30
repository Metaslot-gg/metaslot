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
// change this for json provide for findora gsc and bsc
const provider =
    CHAIN_ID == 56 || CHAIN_ID == 97 || CHAIN_ID == 1204 || CHAIN_ID == 1205 
        ? new ethers.providers.JsonRpcProvider(CHAIN_RPC_URL)
        : new ethers.providers.AlchemyProvider(CHAIN_ID, ALCHEMY_APIKEY)

async function run() {
    console.log("==== start contract events ingestion ====")
    // read only contract
    await client.connect()
    const db = client.db(MONGODB_DATABASE)
    const dice = new ethers.Contract(DICE_GAME_ADDRESS, Dice.abi, provider)
    const coin = new ethers.Contract(COIN_FLIP_ADDRESS, CoinFlip.abi, provider)
    const rps = new ethers.Contract(ROCK_PAPER_SCISSORS, Rps.abi, provider)

    dice.on(
        ["Dice_Play_Event", "Dice_Outcome_Event"],
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "Dice",
            utils.DicePlayEventToJoinedDocument,
            utils.DiceOutcomeEventToJoinedDocument,
            true,
            WAGER_UNIT
        )
    )

    coin.on(
        ["CoinFlip_Play_Event", "CoinFlip_Outcome_Event"],
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "CoinFlip",
            utils.CoinFlipPlayEventToJoinedDocument,
            utils.CoinFlipOutcomeEventToJoinedDocument,
            true,
            WAGER_UNIT
        )
    )

    rps.on(
        ["RockPaperScissors_Play_Event", "RockPaperScissors_Outcome_Event"],
        utils.handleGameEvents(
            db,
            CHAIN_ID,
            "RockPaperScissors",
            utils.RpsPlayEventToJoinedDocument,
            utils.RpsOutcomeEventToJoinedDocument,
            true,
            WAGER_UNIT
        )
    )

    console.log("listening")
    // const events = await diceContract.queryFilter("Dice_Play_Event")
    // const events = await diceContract.queryFilter("Dice_Outcome_Event")

    //_.forEach(events, async (item) => {
    // const record = ContractEventArgsToPlayEvent("Dice", item)
    // await db.collection("GamePlayEvent").insertOne(record)
    // const record = ContractEventArgsToOutComeEvent("Dice", item)
    // await db.collection("GameOutComeEvent").insertOne(record)
    //})
}

run().catch((e) => {
    console.log(e)
    process.exit(0)
})
