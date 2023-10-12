"use client"
import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"

import { InputErrorLabel } from "../InputErrorLabel"
import { NotificationBox } from "../NotificationBox"

import RockPaperScissors from "../../contracts/artifacts/contracts/games/RockPaperScissors.sol/RockPaperScissors.json"
import { useAccount, useBalance, useContractWrite, useContractRead, useNetwork } from "wagmi"
import { watchContractEvent, waitForTransaction, readContract } from "@wagmi/core"
import { ChainConfig } from "../../utils/config"

export function RockPaperScissorsInputForm(props) {
    const {
        register,
        handleSubmit,
        watch: watchFormChanges,
        formState: { errors },
        setError,
    } = useForm({ mode: "onTouched" })
    const [activePlay, setActivePlay] = useState(false)
    const [playLog, setPlayLog] = useState(null)
    const { address } = useAccount()
    const { data: balance } = address ? useBalance({ address: address }) : { data: 0 }
    const [hasSufficientFund, setHasSufficientFund] = useState(true)
    const [wager, setWager] = useState(0)
    const [totalWager, setTotalWager] = useState(0)
    const { chain } = address ? useNetwork() : { chain: null }
    const contractAddress = chain ? ChainConfig[chain.id].RockPaperScissors : "0x00"

    const { writeAsync: ROCK_PAPER_SCISSORS_PLAY } = useContractWrite({
        address: contractAddress,
        abi: RockPaperScissors.abi,
        functionName: "RockPaperScissors_Play",
    })

    // const { data: vrfFee } = useContractRead({
    //     address: contractAddress,
    //     abi: RockPaperScissors.abi,
    //     functionName: "getVRFFee",
    //     args: ["1000000"], // this is different between blockchains!!!!
    // })

    const onSubmit = async (data) => {
        setActivePlay(true)
        const args = [
            BigInt(data.wager),
            "0x0000000000000000000000000000000000000000",
            parseInt(data.expectedResult),
            parseInt(data.numBets),
            BigInt(data.stopGain),
            BigInt(data.stopLoss),
        ]
        const amount = vrfFee * 2n + BigInt(data.wager) * BigInt(data.numBets)

        const tx = await ROCK_PAPER_SCISSORS_PLAY({
            args: args,
            from: address,
            value: amount,
        }).then((resolve) => {
            console.log(resolve)
            return resolve.hash
        })

        const rst = await waitForTransaction({ hash: tx })
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
                        window.setTimeout(() => {
                            setActivePlay(false)
                            console.log("set submitted: false")
                            unwatchOutcomeEvent?.()
                        }, 10000)
                        break
                    }
                }
            }
        )
    }

    useEffect(() => {
        const subscription = watchFormChanges((value, { name, type }) => {
            console.log(name, type, value)
            if (name == "wager" || name == "numBets") {
                const newTotalWager = BigInt(value.wager) * BigInt(value.numBets)
                setWager(value.wager)
                setTotalWager(newTotalWager)
                setHasSufficientFund(balance.value > newTotalWager)
                console.log(
                    "total wager",
                    totalWager,
                    "balance.value",
                    balance.value,
                    newTotalWager >= balance.value
                )
            }
        })
        return () => subscription.unsubscribe()
    }, [watchFormChanges])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col pt-8">
                {activePlay ? (
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
                {hasSufficientFund ? <></> : <InputErrorLabel msg="Insufficient fund" />}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Wager</span>
                    </label>
                    <input
                        type="text"
                        className={`input input-bordered w-full ${
                            errors.wager ? "input-error" : ""
                        }`}
                        {...register("wager", { required: true })}
                    />
                    {errors.wager ? <InputErrorLabel msg="* Required" /> : ""}
                </div>
                <div className="form-control w-full">
                    <label className="label">
                        Rock
                        <input
                            type="radio"
                            value={0}
                            id="expected-result-rock"
                            {...register("expectedResult")}
                            checked
                        />
                    </label>
                    <label className="label">
                        Paper
                        <input
                            type="radio"
                            value={1}
                            id="expected-result-paper"
                            {...register("expectedResult")}
                        />
                    </label>
                    <label className="label">
                        Scissors
                        <input
                            type="radio"
                            value={2}
                            id="expected-result-scissors"
                            {...register("expectedResult")}
                        />
                    </label>
                </div>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Number Bets</span>
                    </label>
                    <input
                        type="text"
                        placeholder="1"
                        className={`input input-bordered w-full ${
                            errors.numBets ? "input-error" : ""
                        }`}
                        {...register("numBets", { required: true, min: 1, max: 100 })}
                    />
                    {errors.numBets ? <InputErrorLabel msg="must between 1 and 100." /> : ""}
                </div>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Stop Gain</span>
                    </label>
                    <input
                        type="text"
                        placeholder={0}
                        className={`input input-bordered w-full ${
                            errors.stopGain ? "input-error" : ""
                        }`}
                        {...register("stopGain", { required: false, min: wager, max: totalWager })}
                    />
                    {errors.stopGain ? (
                        <InputErrorLabel
                            msg={`must greater than ${wager} and less than ${totalWager}`}
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Stop Loss</span>
                    </label>
                    <input
                        type="text"
                        placeholder={0}
                        className={`input input-bordered w-full ${
                            errors.stopLoss ? "input-error" : ""
                        }`}
                        {...register("stopLoss", { required: false, min: wager, max: totalWager })}
                    />
                    {errors.stopLoss ? (
                        <InputErrorLabel
                            msg={`must greater than ${wager} and less than ${totalWager}`}
                        />
                    ) : (
                        ""
                    )}
                </div>
                address ?{" "}
                <button
                    className="btn btn-accent"
                    type="submit"
                    disabled={activePlay ? "disabled" : ""}
                >
                    Play
                </button>
                : <button disabled="true">connect wallet</button>
            </div>
        </form>
    )
}
