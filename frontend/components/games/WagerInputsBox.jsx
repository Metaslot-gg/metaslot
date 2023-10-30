"use client"
import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { InputErrorLabel } from "../InputErrorLabel"
import { useAccount, useBalance } from "wagmi"
import utils from "../../utils"

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

    const [totalWager, setTotalWager] = React.useState(1.0)
    const [hasSufficientFund, setHasSufficientFund] = React.useState(true)

    const [connected, setConnected] = useState(0)

    React.useEffect(() => {
        setConnected(isConnected)
        const tw = parseInt(getValues("wager")) * parseInt(getValues("numBets"))
        setTotalWager(tw)
        setHasSufficientFund(balance?.value > tw)
    }, [])

    React.useEffect(() => {
        /**
         *  validates input values for wager and total wager
         *  uses eth in form values, wager, stop gaiin and stop loss
         *  uses wei for balance checks
         */
        const subscription = watchFormChanges((value, { name, type }) => {
            if ((name == "wager" || name == "numBets") && value.wager != 'NaN') {
                const w = utils.parseWagerValue(value.wager, value.inputUnit)
                console.log(value)
                console.log("parsed wager", w)
                const newTotalWagerEth = parseFloat(value.wager) * parseInt(value.numBets)
                const newTotalWagerWei = w * BigInt(value.numBets)
                setTotalWager(newTotalWagerEth)
                console.log("total wager in wei", newTotalWagerWei)
                setHasSufficientFund(balance.value > newTotalWagerWei)
                setValue("stopGain", newTotalWagerEth.toString())
                setValue("stopLoss", newTotalWagerEth.toString())
            }
        })
        return () => subscription.unsubscribe()
    }, [watchFormChanges])

    return (
        <div className="flex flex-col w-1/3 bg-base-100 my-4 px-8 pb-4 rounded-lg justify-end">
            <input type="hidden" { ...register("inputUnit")} /> 
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
                    {...register("wager", { 
                        required: { value: true, message: "* required" },
                        min: { value: 0.0001, message: "should greater than 0.0001" },
                        max: { value: Number.MAX_SAFE_INTEGER, message: `should less than ${Number.MAX_SAFE_INTEGER}` },
                        pattern: { value: /(\d*.\d{0,4}),?/, message: "only 4 digits of the fraction number" },
                        setValueAs: (w) => utils.formatWagerValue(w) 
                    })}
                />
                <InputErrorLabel msg={errors?.wager?.message} hidden={errors.wager} />
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
                    type="text"
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
                    type="text"
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
