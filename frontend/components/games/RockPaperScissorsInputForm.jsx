"use client"
import React, { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import utils from "../../utils"
import { NotificationBox } from "../NotificationBox"
import { ethers } from "ethers"
import RockPaperScissors from "../../contracts/artifacts/contracts/games/RockPaperScissors.sol/RockPaperScissors.json"
import { useAccount, useNetwork } from "wagmi"
import { waitForTransaction, watchContractEvent, writeContract, readContract, fetchFeeData } from "@wagmi/core"
import { ChainConfig } from "../../utils/config"
import { WagerInputsBox } from "./WagerInputsBox"
import { RockSvg, PaperSvg, ScissorsSvg } from "../icons/RpsSvg"

export function RockPaperScissorsInputForm(props) {
    const methods = useForm({
        mode: "all",
        defaultValues: { wager: "1", numBets: "1", stopGain: "1", stopLoss: "1", inputUnit: utils.envs.INPUT_UNIT },
    })
    const [submitted, setSubmitted] = useState(false)
    const [playLog, setPlayLog] = useState(null)
    const { address, isConnected } = useAccount()
    const { chain } = useNetwork()
    const contractAddress = chain?.id ? ChainConfig[chain.id].Contracts.RockPaperScissors : ChainConfig[137].Contracts.RockPaperScissors 
    const [playerAction, setPlayerAction] = useState(0)

    const PlayerActionImg = () => {
        return playerAction == 0 ? (
            <RockSvg height={144} stroke="#D24B63" />
        ) : playerAction == 1 ? (
            <PaperSvg height={144} stroke="#D24B63" />
        ) : (
            <ScissorsSvg height={144} stroke="#D24B63" />
        )
    }

    const onSubmit = async (data) => {
        setSubmitted(true)
        setPlayLog("Waiting for transaction confirmed.")
        const { gasPrice } = await fetchFeeData()
        const vrfFlatFee = await readContract({
            address: contractAddress,
            abi: RockPaperScissors.abi,
            functionName: "getVRFFee",
            args: ["1000000"], // this is different between blockchains!!!!
        })
        const args = [
            utils.parseWagerValue(data.wager, data.inputUnit),
            "0x0000000000000000000000000000000000000000",
            playerAction,
            parseInt(data.numBets),
            utils.parseWagerValue(data.stopGain, data.inputUnit),
            utils.parseWagerValue(data.stopLoss, data.inputUnit),
        ]
        const amount = (gasPrice * 1000000n + vrfFlatFee) * 2n + utils.parseWagerValue(data.wager, data.inputUnit)  * BigInt(data.numBets)

        const { hash } = await writeContract({
            address: contractAddress,
            abi: RockPaperScissors.abi,
            functionName: "RockPaperScissors_Play",
            args: args,
            account: address,
            value: amount,
        })

        await waitForTransaction({ hash: hash })
        setPlayLog("Transaction confirmed, waiting for process.")

        const unwatchOutcomeEvent = watchContractEvent(
            {
                address: contractAddress,
                abi: RockPaperScissors.abi,
                eventName: "RockPaperScissors_Outcome_Event",
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
                        // 0->Rock, 1-> Paper, 2->Scissors
                        const rstMap = [
                            { draw: 0, win: 2, loss: 1 }, //0
                            { draw: 1, win: 0, loss: 2 }, //1
                            { draw: 2, win: 1, loss: 0 }, //2
                        ]
                        const numWon = _.filter(logs[idx].args.randomActions, (x) => {
                            return x == rstMap[playerAction].win
                        }).length
                        const numDraw = _.filter(logs[idx].args.randomActions, (x) => {
                            return x == rstMap[playerAction].draw
                        }).length
                        const numLoss = logs[idx].args.numGames - numWon - numDraw
                        const payoutInEth = ethers.utils.formatEther(profit)
                        const msg = `Results: number of games: ${logs[idx].args.numGames}, won: ${numWon} , draw: ${numDraw}, loss: ${numLoss}, profit: ${payoutInEth}` 
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
                        <div className="w-2/3">
                            <div className="flex flex-row  py-16 justify-center items-center">
                                <div className="player-action">
                                    <PlayerActionImg />
                                </div>
                                <div className="vs-box text-3xl uppercase">vs</div>
                                <div className="out-come text-8xl uppercase pl-8">?</div>
                            </div>
                            <div className="flex flex-row w-full join join-vertical lg:join-horizontal justify-center space-x-8">
                                <div className="join-item">
                                    <span
                                        className={`btn w-40 h-15 ${
                                            playerAction == 0 ? "btn-accent" : "btn-neutral"
                                        }`}
                                        onClick={() => setPlayerAction(0)}
                                    >
                                        <RockSvg height={50} stroke="#FFFFFF" />
                                        Rock
                                    </span>
                                </div>
                                <div className="join-item">
                                    <span
                                        className={`btn w-40 h-15 ${
                                            playerAction == 1 ? "btn-accent" : "btn-neutral"
                                        }`}
                                        onClick={() => setPlayerAction(1)}
                                    >
                                        <PaperSvg height={50} stroke="#FFFFFF" />
                                        Paper
                                    </span>
                                </div>
                                <div className="join-item">
                                    <span
                                        className={`btn w-40 h-15 ${
                                            playerAction == 2 ? "btn-accent" : "btn-neutral"
                                        }`}
                                        onClick={() => setPlayerAction(2)}
                                    >
                                        <ScissorsSvg height={50} stroke="#FFFFFF" />
                                        Scissors
                                    </span>
                                </div>
                            </div>
                        </div>
                        <WagerInputsBox submitted={submitted} setSubmitted={setSubmitted} />
                    </div>
                </form>
            </FormProvider>
        </section>
    )
}
