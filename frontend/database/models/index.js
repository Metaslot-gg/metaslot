import mongoose from "mongoose"
import { composeWithMongoose } from "graphql-compose-mongoose"

const GamePlayAndOutcomeEvent = new mongoose.Schema(
    {
        chainId: { type: Number, required: true },
        gameName: { type: String, required: true },
        // shared fields
        requestId: { type: String, required: true }, // hex
        playerAddress: { type: String, required: true },
        // play event
        wager: String, // hex
        tokenAddress: String,
        multiplier: Number, // dice
        isOver: Boolean, // dice
        isHeads: Boolean, // coin flip
        playerAction: Number, // rock paper scissors
        numBets: Number,
        stopGain: String, // hex
        stopLoss: String, // hex
        VRFFee: String, // hex
        // outcome event
        payout: String, // hex
        diceOutcomes: [String], // dice, hex
        coinOutcomes: [Number], // coin flip
        randomActions: [Number], // rock paper scissors
        payouts: [String], // [hex]
        numGames: Number,
        // fields used for stat info
        totalWageredInDollor: Number, // wagered * numBets
        totalProfitInDollor: Number, // payout - wagered * numBets
        numBetsWon: Number, // size(payouts[i] != 0x00)
        numBetsLoss: Number, // numBets - numGames - numBetsWon
        // block info from outcome event
        outcomeTxHash: String,
        outcomeTxTmp: { type: Number, index: true }, // unix timestamp in seconds in utc
    },
    { collection: "GamePlayAndOutcomeEvent" }
)

const User = new mongoose.Schema(
    {
        address: { type: String, required: true, unique: true },
        username: String,
        createAt: { type: Date, default: Date.now },
        gameCounts: [
            {
                name: String,
                count: Number,
            },
        ],
        totalWagered: Number,
        totalBets: Number,
        totalBetsWon: Number,
        totalBetsLoss: Number,
        hightestMultiplier: String,
        hightestWin: String,
        grossProfit: String,
        netProfit: String,
    },
    { collection: "User" }
)

const StatInfo = new mongoose.Schema(
    {
        userAddress: String,
        period: String, // daily, weekly, monthly, all-time
        totalVolume: String, // hex
        grossProfit: String, // hex
        createAt: { type: Date, default: Date.now },
    },
    { collection: "StatInfo" }
)

const PipeLineCheckPoints = new mongoose.Schema(
    {
        key: { type: String, unique: true, required: true },
        value: { type: String, required: true },
    },
    { collection: "PipeLineCheckPoints" }
)

// create mongoose models
// make sure we don't instantiate model multiple times.
// https://stackoverflow.com/questions/74750496/overwritemodelerror-cannot-overwrite-user-model-once-compiled-at-mongoose-mo
export const GamePlayAndOutcomeModel =
    mongoose.model.GamePlayAndOutcomeEvent ||
    mongoose.model("GamePlayAndOutcomeEvent", GamePlayAndOutcomeEvent)
export const UserModel = mongoose.model.User || mongoose.model("User", User)
export const StatInfoModel = mongoose.model.StatInfo || mongoose.model("StatInfo", StatInfo)

export const PipelineModel =
    mongoose.model.PipeLineCheckPoints || mongoose.model("PipeLineCheckPoints", PipeLineCheckPoints)

// ObjectTypeComposer
export const GamePlayAndOutcomeTC = composeWithMongoose(GamePlayAndOutcomeModel, {})
export const UserTC = composeWithMongoose(UserModel, {})
export const StatInfoTC = composeWithMongoose(StatInfoModel, {})
