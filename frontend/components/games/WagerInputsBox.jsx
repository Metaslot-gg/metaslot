"use client"
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { InputErrorLabel } from "../InputErrorLabel"

import { useAccount, useBalance } from "wagmi"

export function WagerInputsBox(props) {
    const {
        register,
        formState: { errors, isValid },
        watch: watchFormChanges,
        getValues,
        setValue,
    } = useFormContext() // retrieve all hook methods

    const { submitted, setSubmitted } = props
    const { address, isConnected } = useAccount()
    const { data: balance } = useBalance({ address: address })

    const [totalWager, setTotalWager] = React.useState(1n)
    const [hasSufficientFund, setHasSufficientFund] = React.useState(true)

    const [connected, setConnected] = useState(0)

    React.useEffect(() => {
        setConnected(isConnected)
        const tw = parseInt(getValues("wager")) * parseInt(getValues("numBets"))
        setTotalWager(tw)
        setHasSufficientFund(balance?.value > tw)
    }, [])

    React.useEffect(() => {
        const subscription = watchFormChanges((value, { name, type }) => {
            if (name == "wager" || name == "numBets") {
                //TODO: change to eth unit
                const newTotalWager = BigInt(value.wager) * BigInt(value.numBets)
                console.log(newTotalWager)
                setTotalWager(newTotalWager)
                setHasSufficientFund(balance.value > newTotalWager)
                setValue("stopGain", Number(newTotalWager))
                setValue("stopLoss", Number(newTotalWager))
            }
        })
        return () => subscription.unsubscribe()
    }, [watchFormChanges])

    console.log(isValid)

    return (
        <div className="flex flex-col w-1/3 bg-base-100 my-4 px-8 pb-4 rounded-lg justify-end">
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Wager</span>
                </label>
                <input
                    id="wager"
                    type="text"
                    className={`input input-bordered w-full wager ${
                        errors.wager ? "input-error" : ""
                    }`}
                    disabled={submitted}
                    {...register("wager", { required: true })}
                />
                <InputErrorLabel msg="* Required" hidden={errors.wager} />
            </div>
            <div className="divider"></div>
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Number Bets</span>
                </label>
                <input
                    id="numBets"
                    type="number"
                    className={`input input-bordered w-full numBets ${
                        errors.numBets ? "input-error" : ""
                    }`}
                    disabled={submitted}
                    {...register("numBets", { required: true, min: 1, max: 100 })}
                />
                <InputErrorLabel msg="must between 1 and 100." hidden={errors.numBets} />
            </div>

            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Stop Gain</span>
                </label>
                <input
                    type="number"
                    className={`input input-bordered w-full stopGain ${
                        errors.stopGain ? "input-error" : ""
                    }`}
                    disabled={submitted}
                    {...register("stopGain", {
                        min: getValues("wager"),
                        max: totalWager,
                        deps: ["wager", "numBets"],
                    })}
                />
                <InputErrorLabel
                    hidden={errors.stopGain}
                    msg={`must between ${getValues("wager")} and less than ${totalWager}`}
                />
            </div>

            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Stop Loss</span>
                </label>
                <input
                    type="number"
                    disabled={submitted}
                    className={`input input-bordered w-full stopLoss ${
                        errors.stopLoss ? "input-error" : ""
                    }`}
                    {...register("stopLoss", {
                        required: false,
                        min: getValues("wager"),
                        max: totalWager,
                        deps: ["wager", "numBets"],
                    })}
                />

                <InputErrorLabel
                    hidden={errors.stopLoss}
                    msg={`must between ${getValues("wager")} and less than ${totalWager}`}
                />
            </div>
            <div className="form-control w-full pt-5">
                {hasSufficientFund && connected ? (
                    <button
                        id="submit-btn"
                        className="btn btn-accent"
                        type="submit"
                        disabled={submitted}
                    >
                        Play
                    </button>
                ) : (
                    ""
                )}
                {!connected ? (
                    <div className="alert alert-warning flex justify-center">
                        <span className="label-text text-2xl">Connect First</span>
                    </div>
                ) : (
                    ""
                )}
                {connected && !hasSufficientFund ? (
                    <div className="alert alert-warning flex justify-center">
                        <span className="text-slate-300 text-2xl">Insufficient Fund</span>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    )
}
