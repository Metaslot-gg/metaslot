import { ethers } from "ethers"
import _ from "lodash"

const OneEthInWei = 1n * 10n ** 18n

// Dice
const DicePlayEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        wager: item.args.wager.toHexString(),
        multiplier: item.args.multiplier,
        tokenAddress: item.args.tokenAddress,
        isOver: item.args.isOver,
        numBets: item.args.numBets,
        stopGain: item.args.stopGain.toHexString(),
        stopLoss: item.args.stopLoss.toHexString(),
        VRFFee: item.args.VRFFee.toHexString(),
        requestId: item.args.requestId.toHexString(),
    }
}

const DiceOutcomeEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        payout: item.args.payout.toHexString(),
        diceOutcomes: _.map(item.args.diceOutcomes, (x) => {
            return x.toHexString()
        }),
        payouts: _.map(item.args.payouts, (x) => {
            return x.toHexString()
        }),
        numGames: item.args.numGames,
        requestId: item.args.requestId._hex,
    }
}

// Coin Flip
const CoinFlipPlayEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        wager: item.args.wager.toHexString(),
        tokenAddress: item.args.tokenAddress,
        isHead: item.args.isHeads,
        numBets: item.args.numBets,
        stopGain: item.args.stopGain.toHexString(),
        stopLoss: item.args.stopLoss.toHexString(),
        VRFFee: item.args.VRFFee.toHexString(),
        requestId: item.args.requestId.toHexString(),
    }
}

const CoinFlipOutcomeEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        payout: item.args.payout.toHexString(),
        coinOutcomes: item.args.coinOutcomes,
        payouts: _.map(item.args.payouts, (x) => {
            return x.toHexString()
        }),
        numGames: item.args.numGames,
        requestId: item.args.requestId._hex,
    }
}

// Rock Paper Scissors
const RpsPlayEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        wager: item.args.wager.toHexString(),
        tokenAddress: item.args.tokenAddress,
        playAction: item.args.action,
        numBets: item.args.numBets,
        stopGain: item.args.stopGain.toHexString(),
        stopLoss: item.args.stopLoss.toHexString(),
        VRFFee: item.args.VRFFee.toHexString(),
        requestId: item.args.requestId.toHexString(),
    }
}

const RpsOutcomeEventToJoinedDocument = (item) => {
    return {
        playerAddress: item.args.playerAddress,
        payout: item.args.payout.toHexString(),
        randomActions: item.args.randomActions,
        payouts: _.map(item.args.payouts, (x) => {
            return x.toHexString()
        }),
        numGames: item.args.numGames,
        requestId: item.args.requestId._hex,
    }
}

// mongodb driver upsert operation
const upsertToCollection = (collection, filter, update) => {
    return (
        collection
            .updateOne(filter, { $set: { ...update } }, { upsert: true })
            //.then(console.log)
            .catch(console.error)
    )
}

// mongoose upsert operation
const upsertToModel = (model, conditions, update) => {
    return (
        model
            .findOneAndUpdate(conditions, update, {
                upsert: true,
            })
            // .then(console.log)
            .catch(console.error)
    )
}

const getCheckPoint = (db, key) => {
    return db.collection("PipeLineCheckPoints").findOne({ key: key })
}

const handleGameEvents =
    (db, chainId, gameName, playEventHandler, outcomeEventHandler, commit, wagerUnit = "wei") => async (data) => {
        if (data.event?.includes("Outcome_Event")) {
            const outcomeRecord = outcomeEventHandler(data)
            const block = await data.getBlock()
            // TODO; should change to Number after change to eth
            const totalWager = BigInt(data.args.wager) * BigInt(data.args.numBets)
            const profit = BigInt(data.args.payout) - totalWager
            const wons = _.filter(data.args.payouts, (x) => {
                return BigInt(x) > 0n
            }).length
            await upsertToCollection(
                db.collection("GamePlayAndOutcomeEvent"),
                { requestId: outcomeRecord.requestId },
                {
                    gameName: gameName,
                    chainId: chainId,
                    outcomeTxHash: data.transactionHash,
                    outcomeTxTmp: block.timestamp,
                    totalWageredInDollor: wagerUnit == "wei" ? totalWager : parseFloat(ethers.utils.formatEther(totalWager)),
                    totalProfitInDollor: wagerUnit == "wei" ? profit : parseFloat(ethers.utils.formatEther(profit)),
                    numBetsWon: wons,
                    numBetsLoss: data.args.numGames - wons,
                    ...outcomeRecord,
                }
            ).catch(console.error)
            commit &&
                (await upsertToCollection(
                    db.collection("PipeLineCheckPoints"),
                    { key: chainId.toString() + "-" + gameName },
                    { value: block.number }
                ).catch(console.error))
        }
        if (data.event?.includes("Play_Event")) {
            const playRecord = playEventHandler(data)
            await upsertToCollection(
                db.collection("GamePlayAndOutcomeEvent"),
                { requestId: playRecord.requestId },
                { gameName: gameName, chainId: chainId, ...playRecord }
            ).catch(console.error)
        }
    }

export default {
    DicePlayEventToJoinedDocument,
    DiceOutcomeEventToJoinedDocument,
    CoinFlipPlayEventToJoinedDocument,
    CoinFlipOutcomeEventToJoinedDocument,
    RpsPlayEventToJoinedDocument,
    RpsOutcomeEventToJoinedDocument,
    upsertToCollection,
    upsertToModel,
    getCheckPoint,
    handleGameEvents,
}
