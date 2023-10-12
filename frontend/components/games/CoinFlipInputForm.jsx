"use client"
import React, { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"

import { NotificationBox } from "../NotificationBox"

import CoinFlip from "../../contracts/artifacts/contracts/games/CoinFlip.sol/CoinFlip.json"
import { useAccount, useNetwork } from "wagmi"
import { waitForTransaction, watchContractEvent, writeContract, readContract } from "@wagmi/core"
import utils from "../../utils"
import { ChainConfig } from "../../utils/config"
import { WagerInputsBox } from "./WagerInputsBox"
import { CoinHeadSvg } from "../icons/CoinSvg"
export function CoinFlipInputForm(props) {
    const methods = useForm({
        mode: "all",
        defaultValues: { wager: "1", numBets: "1", stopGain: "1", stopLoss: "1" },
    })
    const [submitted, setSubmitted] = useState(false)
    const [playLog, setPlayLog] = useState(null)
    const { address, isConnected } = useAccount()
    const { chain } = isConnected ? useNetwork() : { chain: { id: 137 } }
    const contractAddress = ChainConfig[chain.id].Contracts.CoinFlip
    const [head, setHead] = useState(true)

    const onSubmit = async (data) => {
        setSubmitted(true)
        setPlayLog("Waiting for transaction confirmed.")
        const vrfFee = await readContract({
            address: contractAddress,
            abi: CoinFlip.abi,
            functionName: "getVRFFee",
            args: ["1000000"], // this is different between blockchains!!!!
        })
        const args = [
            BigInt(data.wager),
            "0x0000000000000000000000000000000000000000",
            head,
            parseInt(data.numBets),
            BigInt(data.stopGain),
            BigInt(data.stopLoss),
        ]
        const amount = vrfFee * 2n + BigInt(data.wager) * BigInt(data.numBets)

        const { hash } = await writeContract({
            address: contractAddress,
            abi: CoinFlip.abi,
            functionName: "CoinFlip_Play",
            args: args,
            account: address,
            value: amount,
        })

        await waitForTransaction({ hash: hash })
        setPlayLog("Transaction confirmed, waiting for process.")

        const unwatchOutcomeEvent = watchContractEvent(
            {
                address: contractAddress,
                abi: CoinFlip.abi,
                eventName: "CoinFlip_Outcome_Event",
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
                        console.log("in am here")
                        console.log(data.wager, data.numBets)
                        const totalWagers = parseInt(data.wager) * parseInt(data.numBets)
                        console.log("total wager: ", totalWagers, "payout:", logs[idx].args.payout)
                        const profit = logs[idx].args.payout - BigInt(totalWagers)
                        const msg =
                            profit > 0
                                ? `You won! Your payout: ${logs[idx].args.payout}, profit: ${profit}`
                                : "Sorry, you lost. Good luck at the next time."
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
                            <div className="flex flex-row justify-center py-16">
                                <CoinHeadSvg width={260} height={260} />
                            </div>
                            <div className="flex flex-row w-full join join-vertical lg:join-horizontal justify-center space-x-8">
                                <div className="join-item">
                                    <span
                                        className={`btn ${
                                            head ? "btn-accent" : "btn-neutral"
                                        } w-40`}
                                        onClick={() => setHead(true)}
                                    >
                                        <img
                                            src="/images/svg/coin-head.svg"
                                            width={40}
                                            height={40}
                                        />{" "}
                                        Head
                                    </span>
                                </div>
                                <div className="join-item">
                                    <span
                                        className={`btn ${
                                            !head ? "btn-accent" : "btn-neutral"
                                        } w-40`}
                                        onClick={() => setHead(false)}
                                    >
                                        <img
                                            src="/images/svg/coin-head.svg"
                                            width={40}
                                            height={40}
                                        />{" "}
                                        tail
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
