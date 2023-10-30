"use client"
import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useAccount, useNetwork } from "wagmi"
import Dice from "../../contracts/artifacts/contracts/games/Dice.sol/Dice.json"
import { ethers } from "ethers"
import { waitForTransaction, watchContractEvent, writeContract, readContract, fetchFeeData } from "@wagmi/core"
import { NotificationBox } from "../NotificationBox"

import { ChainConfig } from "../../utils/config"
import utils from "../../utils/index"
import { DiceRangeInputsForm } from "./DiceRangeInputsForm"
import { WagerInputsBox } from "./WagerInputsBox"

import _ from "lodash"

export function DiceInputForm(props) {
    const [submitted, setSubmitted] = useState(false)
    const [playLog, setPlayLog] = useState(null)
    const { address, isConnected } = useAccount()
    const { chain } = useNetwork() 
    const contractAddress = chain?.id ? ChainConfig[chain.id]?.Contracts.Dice : ChainConfig[137]?.Contracts.Dice

    const methods = useForm({
        mode: "all",
        defaultValues: {
            diceRange: "50.0",
            rollOver: true,
            winChance: "50.0",
            multiplier: "1.98",
            wager: "1",
            inputUnit: utils.envs.INPUT_UNIT,
            numBets: "1",
            stopGain: "1",
            stopLoss: "1",
        },
    })
    const onSubmit = async (data) => {
        setSubmitted(true)
        setPlayLog("Waiting for transaction confirmed.")
        const { gasPrice } = await fetchFeeData()
        const vrfFlatFee = await readContract({
            address: contractAddress,
            abi: Dice.abi,
            functionName: "getVRFFee",
            args: ["1000000"], // this is different between blockchains!!!!
        })
        const m = utils.toRawMultiplier(data.multiplier)
        
        // const wagerInWei = utils.parseWagerValue(data.wager, data.inputUnit)
        const args = [
            utils.parseWagerValue(data.wager, data.inputUnit),
            m,
            "0x0000000000000000000000000000000000000000",
            true,
            parseInt(data.numBets),
            utils.parseWagerValue(data.stopGain, data.inputUnit),
            utils.parseWagerValue(data.stopLoss, data.inputUnit)
        ]
        const amount = (gasPrice * 1000000n + vrfFlatFee) * 2n + utils.parseWagerValue(data.wager, data.inputUnit) * BigInt(data.numBets)
        console.log("write to contract", args, address, amount)

        const { hash } = await writeContract({
            address: contractAddress,
            abi: Dice.abi,
            functionName: "Dice_Play",
            args: args,
            account: address,
            value: amount,
        })
        await waitForTransaction({ hash: hash })
        setPlayLog("transaction confirmed, waiting for results.")
        const unwatchOutcomeEvent = watchContractEvent(
            {
                abi: Dice.abi,
                address: contractAddress,
                eventName: "Dice_Outcome_Event",
            },
            (logs) => {
                console.log(logs)
                for (let idx = 0; idx < logs.length; idx++) {
                    console.log(
                        logs[idx].args.playerAddress,
                        address,
                        logs[idx].args.playerAddress == address
                    )
                    if (logs[idx].args.playerAddress == address) {
                        const totalWagers = logs[idx].args.wager * BigInt(parseInt(logs[idx].args.numBets))
                        const profit = logs[idx].args.payout - totalWagers
                        const aa = _.filter(logs[idx].args.payouts, (x) => {
                            return x > 0n
                        })
                        const numWon = _.filter(logs[idx].args.payouts, (x) => {
                            return x > 0n
                        }).length
                        const numLoss = logs[idx].args.numGames - numWon
                        const payoutInEth = ethers.utils.formatEther(profit)
                        const msg = `Results: number of games: ${logs[idx].args.numGames}, won: ${numWon} , loss: ${numLoss}, profit: ${payoutInEth}`
                        setPlayLog(msg)
                        setSubmitted(false)
                        unwatchOutcomeEvent?.()
                        break
                    }
                }
            }
        )
    }

    return (
        <section className="input-box pt-8 w-full max-w-full">
            {playLog != null ? (
                <NotificationBox
                    className="bg-teal-100 border-t-4rounded text-teal-900 px-4 py-3 shadow-md"
                    msg={playLog}
                    role="alert"
                    handleClose={() => {
                        setSubmitted(false)
                    }}
                />
            ) : (
                <></>
            )}
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className="flex flex-row space-x-4 p-4 dice-input-box rounded-md">
                        <DiceRangeInputsForm />
                        <WagerInputsBox submitted={submitted} setSubmitted={setSubmitted} />
                    </div>
                </form>
            </FormProvider>
        </section>
    )
}
